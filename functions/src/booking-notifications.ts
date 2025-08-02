import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { Expo } from 'expo-server-sdk';

const db = admin.firestore();
const expo = new Expo();

export const bookingNotifications = onDocumentWritten(
  'bookings/{bookingId}',
  async (event) => {
    const { change, params } = event.data;
    const { bookingId } = params;

    if (!change) {
      logger.warn(`bookingNotifications: No data change for bookingId: ${bookingId}`);
      return;
    }

    // Handle document deletion
    if (!change.after.exists) {
      logger.info(`bookingNotifications: Document deleted for bookingId: ${bookingId}, no action taken.`);
      return;
    }

    const bookingData = change.after.data();

    // Handle new booking request (creation)
    if (!change.before.exists) {
      logger.info(`bookingNotifications: New booking created with id: ${bookingId}`);
      const ownerId = bookingData.ownerId;
      const requester = await getUser(bookingData.requesterId);

      if (requester && ownerId) {
        const message = `${requester.name} has requested to book your ${bookingData.equipmentName}`;
        await sendNotification(ownerId, 'New Booking Request', message, { bookingId });
      }
      return;
    }

    // Handle booking status update
    const previousBookingData = change.before.data();
    if (bookingData.status !== previousBookingData.status) {
      logger.info(`bookingNotifications: Status changed for bookingId: ${bookingId}`);
      const requesterId = bookingData.requesterId;
      let message = '';

      if (bookingData.status === 'accepted') {
        message = `Your booking for ${bookingData.equipmentName} has been accepted.`;
      } else if (bookingData.status === 'rejected') {
        message = `Your booking for ${bookingData.equipmentName} has been rejected.`;
      }

      if (message) {
        await sendNotification(requesterId, 'Booking Status Update', message, { bookingId });
      }
    }
  }
);

async function getUser(userId: string) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.data();
  } catch (error) {
    logger.error(`Error fetching user data for userId: ${userId}`, error);
    return null;
  }
}

async function sendNotification(
  recipientId: string,
  title: string,
  body: string,
  data: { [key: string]: string }
) {
  logger.info(`Attempting to send notification to recipient: ${recipientId}`);
  const tokenDoc = await db.collection('pushTokens').doc(recipientId).get();
  const pushToken = tokenDoc.data()?.token;

  if (!pushToken) {
    logger.warn(`No push token found for recipient: ${recipientId}.`);
    return;
  }

  if (!Expo.isExpoPushToken(pushToken)) {
    logger.error(`Push token ${pushToken} is not a valid Expo push token for user ${recipientId}!`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default' as const,
    title: title,
    body: body,
    data: data,
  };

  try {
    const ticketChunk = await expo.sendPushNotificationsAsync([message]);
    logger.info('Notification sent successfully', { ticket: ticketChunk[0] });
    // You can add more logic here to handle ticket receipts, e.g., checking for errors
  } catch (error) {
    logger.error('Error sending push notification:', error);
  }
}