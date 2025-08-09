import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { logger } from 'firebase-functions/v2'; // Fixed: Use V2 logger for consistency
import * as admin from 'firebase-admin';
import { Expo } from 'expo-server-sdk';



export const bookingNotifications = onDocumentWritten(
  'bookings/{bookingId}',
  async (event) => {
    // Add this debug log first thing
    logger.info('🔥 BOOKING NOTIFICATION FUNCTION TRIGGERED!', { 
      bookingId: event.params.bookingId,
      hasChange: !!event.data 
    });
    
    const bookingId = event.params.bookingId;
    const change = event.data; 
    
    if (!change) {
      logger.warn(`bookingNotifications: No data change for bookingId: ${bookingId}`);
      return;
    }

    const { before, after } = change;

    logger.info(`bookingNotifications: Processing event for bookingId: ${bookingId}`);

    try {
      // Handle document deletion
      if (!after.exists) {
        logger.info(`bookingNotifications: Document deleted for bookingId: ${bookingId}, no action taken.`);
        return;
      }

      const bookingData = after.data();
      
      if (!bookingData) {
        logger.error(`bookingNotifications: No booking data found for bookingId: ${bookingId}`);
        return;
      }
      
      // Validate required fields (updated to match your interface)
      if (!bookingData.ownerId || !bookingData.renterId || !bookingData.equipmentId) {
        logger.error(`bookingNotifications: Missing required fields for bookingId: ${bookingId}`, {
          ownerId: !!bookingData.ownerId,
          renterId: !!bookingData.renterId,
          equipmentId: !!bookingData.equipmentId
        });
        return;
      }

      // Handle new booking request (creation)
      if (!before.exists) {
        await handleNewBookingRequest(bookingId, bookingData, after);
        return;
      }

      // Handle booking status update
      const previousBookingData = before.data();
      if (bookingData.status !== previousBookingData?.status) {
        await handleBookingStatusUpdate(bookingId, bookingData, after);
      }

    } catch (error) {
      logger.error(`bookingNotifications: Unexpected error processing bookingId ${bookingId}:`, error);
    }
  }
);

async function handleNewBookingRequest(
  bookingId: string,
  bookingData: any,
  snapshot: admin.firestore.DocumentSnapshot
) {
  // Check if already notified to prevent duplicates
  if (bookingData.hasNotifiedCreation) {
    logger.info(`bookingNotifications: New booking ${bookingId} already notified.`);
    return;
  }

  logger.info(`bookingNotifications: Processing new booking request: ${bookingId}`);

  try {
    const requester = await getUser(bookingData.renterId); 
    const equipment = await getEquipment(bookingData.equipmentId); 
    
    if (!requester) {
      logger.error(`bookingNotifications: Could not fetch requester data for userId: ${bookingData.renterId}`);
      // Mark as notified even if we can't get user data to prevent infinite retries
      await snapshot.ref.update({ hasNotifiedCreation: true });
      return;
    }

    if (!equipment) {
      logger.error(`bookingNotifications: Could not fetch equipment data for equipmentId: ${bookingData.equipmentId}`);
      await snapshot.ref.update({ hasNotifiedCreation: true });
      return;
    }

    const title = 'New Booking Request';
    const message = `${requester.name || 'Someone'} has requested to book your ${equipment.name || 'equipment'}`;
    const notificationData = {
      bookingId,
      type: 'booking_request',
      equipmentId: bookingData.equipmentId,
      equipmentName: equipment.name || 'equipment',
      renterId: bookingData.renterId
    };

    await sendNotification(bookingData.ownerId, title, message, notificationData);

    // Mark as notified to prevent duplicate notifications
    await snapshot.ref.update({ hasNotifiedCreation: true });
    
    logger.info(`bookingNotifications: New booking notification processed for bookingId: ${bookingId}`);

  } catch (error) {
    logger.error(`bookingNotifications: Error handling new booking request for ${bookingId}:`, error);
  }
}

async function handleBookingStatusUpdate(
  bookingId: string,
  bookingData: any,
  snapshot: admin.firestore.DocumentSnapshot
) {
  // Check if already notified to prevent duplicates
  if (bookingData.hasNotifiedStatusChange) {
    logger.info(`bookingNotifications: Status change for booking ${bookingId} already notified.`);
    return;
  }

  logger.info(`bookingNotifications: Processing status change for bookingId: ${bookingId} to ${bookingData.status}`);

  try {
    const equipment = await getEquipment(bookingData.equipmentId); // Get equipment details
    let message = '';
    let notificationType = '';

    const equipmentName = equipment?.name || 'your equipment';

    switch (bookingData.status) {
      case 'accepted':
        message = `Your booking for ${equipmentName} has been confirmed.`;
        notificationType = 'booking_confirmed';
        break;
      case 'cancelled':
        message = `Your booking for ${equipmentName} has been cancelled.`;
        notificationType = 'booking_cancelled';
        break;
      default:
        logger.info(`bookingNotifications: No notification needed for status: ${bookingData.status}`);
        await snapshot.ref.update({ hasNotifiedStatusChange: true });
        return;
    }

    const notificationData = {
      bookingId,
      type: notificationType,
      status: bookingData.status,
      equipmentId: bookingData.equipmentId,
      equipmentName: equipmentName
    };

    await sendNotification(bookingData.renterId, 'Booking Status Update', message, notificationData); // Changed to renterId

    // Mark as notified to prevent duplicate notifications
    await snapshot.ref.update({ hasNotifiedStatusChange: true });

    logger.info(`bookingNotifications: Status update notification processed for bookingId: ${bookingId}`);

  } catch (error) {
    logger.error(`bookingNotifications: Error handling status update for ${bookingId}:`, error);
  }
}

async function getEquipment(equipmentId: string) {
  try {
    const equipmentDoc = await admin.firestore().collection('equipment').doc(equipmentId).get();
    
    if (!equipmentDoc.exists) {
      logger.warn(`getEquipment: Equipment document not found for equipmentId: ${equipmentId}`);
      return null;
    }

    const equipmentData = equipmentDoc.data();
    logger.info(`getEquipment: Successfully retrieved equipment data for equipmentId: ${equipmentId}`);
    return equipmentData;

  } catch (error) {
    logger.error(`getEquipment: Error fetching equipment data for equipmentId: ${equipmentId}`, error);
    return null;
  }
}

async function getUser(userId: string) {
  try {
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      logger.warn(`getUser: User document not found for userId: ${userId}`);
      return null;
    }

    const userData = userDoc.data();
    logger.info(`getUser: Successfully retrieved user data for userId: ${userId}`);
    return userData;

  } catch (error) {
    logger.error(`getUser: Error fetching user data for userId: ${userId}`, error);
    return null;
  }
}

async function createNotification(
  recipientId: string,
  title: string,
  body: string,
  data: { [key: string]: string }
) {
  try {
    await admin.firestore().collection('notifications').add({
      userId: recipientId,
      title,
      message: body,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      read: false,
      data,
    });
    logger.info(`createNotification: Notification document created for recipient: ${recipientId}`);
    return true;
  } catch (error) {
    logger.error(`createNotification: Error creating notification document for recipient: ${recipientId}`, error);
    return false;
  }
}

async function sendNotification(
  recipientId: string,
  title: string,
  body: string,
  data: { [key: string]: string }
) {
  logger.info(`sendNotification: Processing notification for recipient: ${recipientId}`);
  
  try {
    // Create in-app notification document (always do this)
    const notificationCreated = await createNotification(recipientId, title, body, data);
    
    // Get push token for push notification
    const tokenDoc = await admin.firestore().collection('pushTokens').doc(recipientId).get();
    const pushToken = tokenDoc.data()?.token;

    if (!pushToken) {
      logger.warn(`sendNotification: No push token found for recipient: ${recipientId}, in-app notification created: ${notificationCreated}`);
      return;
    }

    if (!Expo.isExpoPushToken(pushToken)) {
      logger.error(`sendNotification: Invalid Expo push token for user ${recipientId}: ${pushToken}`);
      return;
    }

    const message = {
      to: pushToken,
      sound: 'default' as const,
      title: title,
      body: body,
      data: data,
    };

    logger.info(`sendNotification: Sending push notification to ${pushToken.substring(0, 20)}...`);

    const expo = new Expo();
    const chunks = expo.chunkPushNotifications([message]);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        logger.info('sendNotification: Push notification sent successfully', { 
          tickets: ticketChunk,
          recipientId 
        });

        // Check for error tickets
        const errorTickets = ticketChunk.filter(ticket => ticket.status === 'error');
        if (errorTickets.length > 0) {
          logger.error('sendNotification: Error tickets found:', errorTickets);
        }

      } catch (error) {
        logger.error('sendNotification: Error sending push notification chunk:', error);
      }
    }

  } catch (error) {
    logger.error(`sendNotification: Unexpected error processing notification for ${recipientId}:`, error);
  }
}