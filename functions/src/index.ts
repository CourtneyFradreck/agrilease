import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Expo } from "expo-server-sdk";

admin.initializeApp();
const db = admin.firestore();
const expo = new Expo();

export const registerPushToken = functions.https.onCall(
  async (data: any, context: any) => {
    const { token } = data;

    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "The function must be called while authenticated."
      );
    }

    const userId = context.auth.uid; // Use the authenticated user's UID

    if (!token) {
      throw new functions.https.HttpsError(
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
      return { success: true };
    } catch (error) {
      console.error("Error registering push token:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to register push token."
      );
    }
  }
);

export const sendNotification = functions.https.onCall(
  async (data: any, context: any) => {
    const { targetUserId, title, body, data: notificationData = {} } = data;

    // Optional: Add authentication/authorization checks if only specific users
    // can send notifications
    // if (!context.auth) {
    //   throw new functions.https.HttpsError(
    //     "unauthenticated",
    //     "The function must be called while authenticated."
    //   );
    // }

    if (!targetUserId || !title || !body) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing targetUserId, title, or body."
      );
    }

    try {
      // Retrieve the target user's push token from Firestore
      const doc = await db.collection("pushTokens").doc(targetUserId).get();
      const pushToken = doc.data()?.token;

      if (!pushToken) {
        console.log(`No push token found for user: ${targetUserId}`);
        return { success: false, message: "No push token found for user." };
      }

      // Check that all your push tokens appear to be valid Expo push tokens
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token!`);
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
      // If you're sending more than 100 notifications at once, you need to batch them.
      const chunks = expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
        }
      }

      // You can handle the tickets here to check for errors or get receipt IDs
      // For simplicity, we're just returning success for now.
      return { success: true, tickets: tickets };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Unable to send notification."
      );
    }
  }
);