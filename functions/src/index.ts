import { onCall, HttpsError, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';

import * as admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';


admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

/**
 * Registers a user's Expo Push Token in Firestore.
 * This function should be called from the client app with the user's push token.
 */
export const registerPushToken = onCall(
  async (request: CallableRequest) => { // Type the request object for better safety
    const { token } = request.data as { token?: string }; // Cast data to expected type

    // Check if the user is authenticated
    if (!request.auth) {
      logger.warn("registerPushToken: Unauthenticated call detected.");
      throw new HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const userId = request.auth.uid;

    if (!token) {
      logger.warn(`registerPushToken: Missing 'token' argument for user ${userId}.`);
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a 'token' argument."
      );
    }

    try {
      // Store the token in Firestore, using the user's UID as the document ID
      await db.collection("pushTokens").doc(userId).set({
        token: token,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      logger.info('registerPushToken: Push token registered successfully for user:', userId);
      return { success: true };
    } catch (error) {
      logger.error("registerPushToken: Error registering push token for user:", userId, error);
      throw new HttpsError(
        "internal",
        "Unable to register push token."
      );
    }
  }
);

/**
 * Sends a custom push notification to a specific user.
 * This function can be called by other functions or from an authenticated client (with proper security rules).
 */
export const sendCustomNotification = onCall(
  async (request: CallableRequest) => {
    const { targetUserId, title, body, data: notificationData = {} } = request.data as {
      targetUserId?: string;
      title?: string;
      body?: string;
      data?: { [key: string]: any };
    };

    // Optional: Add authentication/authorization checks if only specific users
    // can send notifications (e.g., admin role check)
    // if (!request.auth || !request.auth.token.admin) {
    //   throw new HttpsError('permission-denied', 'Only admin users can send custom notifications.');
    // }

    if (!targetUserId || !title || !body) {
      logger.warn(`sendCustomNotification: Missing required arguments: targetUserId=${targetUserId}, title=${title}, body=${body}`);
      throw new HttpsError(
        "invalid-argument",
        "Missing targetUserId, title, or body."
      );
    }

    try {
      // Retrieve the target user's push token from Firestore
      const doc = await db.collection("pushTokens").doc(targetUserId).get();
      const pushToken = doc.data()?.token;

      if (!pushToken) {
        logger.log(`sendCustomNotification: No push token found for user: ${targetUserId}`);
        return { success: false, message: "No push token found for user." };
      }

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        logger.error(`sendCustomNotification: Push token ${pushToken} is not a valid Expo push token for user ${targetUserId}!`);
        return { success: false, message: "Invalid Expo push token." };
      }

      // Construct the message
      const messages = [{
        to: pushToken,
        sound: "default",
        title: title,
        body: body,
        data: notificationData,
      }];

      // The Expo push notification service accepts batches of notifications up to 100.
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          logger.error("sendCustomNotification: Error sending push notification chunk:", error);
        }
      }

      logger.info('sendCustomNotification: Custom notification sent with tickets:', tickets);
      return { success: true, tickets: tickets };
    } catch (error) {
      logger.error("sendCustomNotification: Error sending notification:", error);
      throw new HttpsError(
        "internal",
        "Unable to send notification."
      );
    }
  }
);

/**
 * Sends a notification when a new chat message is created in Firestore.
 * Triggers on: /messages/{messageId} onCreate
 */
export const sendChatMessageNotification = onDocumentCreated(
  "messages/{messageId}", // Path definition for V2 Firestore trigger
  async (event: { data: DocumentSnapshot | undefined; params: { messageId: string } }) => {
    // event.data is the DocumentSnapshot of the newly created document
    // event.params contains the wildcard values from the path (e.g., messageId)

    const snapshot = event.data;
    const messageId = event.params.messageId;

    if (!snapshot) {
      logger.warn(`sendChatMessageNotification: No data found for message with ID: ${messageId} during onCreate event.`);
      return; // Exit if no document data
    }

    const message = snapshot.data();
    if (!message) {
      logger.error("sendChatMessageNotification: Snapshot data is null or undefined for message:", messageId);
      return; // Exit if snapshot data is empty
    }

    // Explicitly define an interface for your message for stronger type checking
    interface ChatMessage {
        senderId: string;
        receiverId: string;
        text: string;
        hasNotified?: boolean;
        // Add other properties your message might have
    }

    // Cast the message data to your interface (optional, but good practice)
    const chatMessage = message as ChatMessage;

    const senderId = chatMessage.senderId;
    const receiverId = chatMessage.receiverId;
    const text = chatMessage.text;
    const hasNotified = chatMessage.hasNotified;


    if (hasNotified) {
      logger.info(`sendChatMessageNotification: Message ${messageId} already processed (hasNotified set).`);
      return;
    }

    if (!senderId || !receiverId) {
        logger.error(`sendChatMessageNotification: Missing senderId or receiverId for message ${messageId}.`);
        return;
    }

    const receiverDoc = await db.collection("pushTokens").doc(receiverId).get();
    const pushToken = receiverDoc.data()?.token;

    if (!pushToken) {
      logger.log(`sendChatMessageNotification: No push token found for recipient: ${receiverId}.`);
      return;
    }

    const senderDoc = await db.collection("users").doc(senderId).get();
    const senderName = senderDoc.data()?.name || "Someone";

    const messages = [{
      to: pushToken,
      sound: "default",
      title: `New message from ${senderName}`,
      body: text,
      data: { chatId: messageId },
    }];

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        logger.error("sendChatMessageNotification: Error sending push notification chunk:", error);
      }
    }

    // Mark message as notified *after* attempting to send notifications
    await snapshot.ref.update({ hasNotified: true });

    logger.info(`sendChatMessageNotification: Notification attempt completed for message ${messageId}. Tickets:`, tickets);
  }
);