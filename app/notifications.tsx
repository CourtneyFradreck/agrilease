import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../FirebaseConfig';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BOOKING_COLOR = '#3B82F6';
const CHAT_COLOR = '#10B981';

export default function NotificationsScreen() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.id),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        // Convert Firestore timestamp to JavaScript Date for easier handling
        timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)
      }));
      console.log('Fetched notifications:', notifs);
      setNotifications(notifs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read when pressed
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'booking_request':
          // Navigate to booking requests for owners
          router.push(`/booking/requests`);
          break;
        case 'booking_confirmed':
        case 'booking_cancelled':
          // Navigate to user's bookings for renters
          router.push(`/booking/my-bookings`);
          break;
        case 'chat_message':
          // Navigate to specific conversation
          if (notification.data.conversationId) {
            router.push(`/messages/${notification.data.conversationId}`);
          } else {
            router.push(`/messages`);
          }
          break;
        default:
          // Handle other notification types or fallback
          if (notification.data?.bookingId) {
            router.push(`/booking/requests`);
          } else if (notification.data?.conversationId) {
            router.push(`/messages/${notification.data.conversationId}`);
          }
          break;
      }
    } else {
      // Fallback to original logic for notifications without type
      if (notification.data?.bookingId) {
        router.push(`/booking/requests`);
      } else if (notification.data?.conversationId) {
        router.push(`/messages/${notification.data.conversationId}`);
      }
    }
  };

  const getNotificationIcon = (notification) => {
    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'booking_request':
          return 'calendar-outline';
        case 'booking_confirmed':
          return 'checkmark-circle-outline';
        case 'booking_cancelled':
          return 'close-circle-outline';
        case 'chat_message':
          return 'chatbubble-outline';
        default:
          return 'notifications-outline';
      }
    }
    
    // Fallback logic
    if (notification.data?.bookingId) {
      return 'calendar-outline';
    } else if (notification.data?.conversationId) {
      return 'chatbubble-outline';
    }
    return 'notifications-outline';
  };

  const getNotificationIconColor = (notification) => {
    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'booking_request':
        case 'booking_confirmed':
        case 'booking_cancelled':
          return BOOKING_COLOR;
        case 'chat_message':
          return CHAT_COLOR;
        default:
          return MAIN_COLOR;
      }
    }
    
    // Fallback logic
    if (notification.data?.bookingId) {
      return BOOKING_COLOR;
    } else if (notification.data?.conversationId) {
      return CHAT_COLOR;
    }
    return MAIN_COLOR;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInMs = now - notificationDate;
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.notificationItemRead : styles.notificationItemUnread,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationIconContainer}>
        <Ionicons
          name={getNotificationIcon(item)}
          size={24}
          color={getNotificationIconColor(item)}
        />
        {!item.read && <View style={styles.unreadIndicator} />}
      </View>
      
      <View style={styles.notificationContent}>
        <Text
          style={[
            styles.notificationTitle,
            item.read ? styles.textRead : styles.textUnread,
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.notificationMessage,
            item.read ? styles.textRead : {},
          ]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <View style={styles.notificationFooter}>
          <Text
            style={[
              styles.notificationTimestamp,
              item.read ? styles.textRead : {},
            ]}
          >
            {formatTimestamp(item.timestamp)}
          </Text>
          {item.data?.equipmentName && (
            <Text style={styles.equipmentTag}>
              {item.data.equipmentName}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView style={styles.headerInner}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={HEADER_TEXT_COLOR} />
          </TouchableOpacity>
          <View style={styles.headerTextContent}>
            <Text style={styles.headerTitle}>Notifications</Text>
            <Text style={styles.headerDescription}>
              {notifications.length > 0 
                ? `${notifications.filter(n => !n.read).length} unread of ${notifications.length} total`
                : 'Your latest updates and alerts'
              }
            </Text>
          </View>
        </SafeAreaView>
      </View>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotificationItem}
          style={styles.notificationsList}
          contentContainerStyle={styles.notificationsListContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Ionicons 
            name="notifications-outline" 
            size={64} 
            color={TEXT_SECONDARY_GREY} 
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateTitle}>No Notifications Yet</Text>
          <Text style={styles.emptyStateText}>
            When you receive booking requests, confirmations, or messages, they'll appear here.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD_BACKGROUND,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
  },
  loadingText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    marginTop: 16,
  },
  header: {
    backgroundColor: MAIN_COLOR,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 50,
    paddingBottom: 10,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTextContent: {
    flex: 1,
    alignItems: 'flex-start',
    marginLeft: 10,
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
    textAlign: 'left',
  },
  headerDescription: {
    fontFamily: 'Archivo-Regular',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'left',
    marginTop: 2,
  },
  notificationsList: {
    marginTop: 40,
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 85 : 95,
  },
  notificationsListContent: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
  },
  notificationItemUnread: {
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderColor: MAIN_COLOR,
    borderLeftWidth: 4,
  },
  notificationItemRead: {
    backgroundColor: CARD_BACKGROUND,
    borderColor: BORDER_GREY,
    opacity: 0.85,
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 12,
    marginTop: 2,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  textUnread: {
    color: TEXT_PRIMARY_DARK,
  },
  textRead: {
    color: TEXT_SECONDARY_GREY,
  },
  notificationMessage: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 8,
    lineHeight: 20,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTimestamp: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
  },
  equipmentTag: {
    fontFamily: 'Archivo-Medium',
    fontSize: 10,
    color: MAIN_COLOR,
    backgroundColor: `${MAIN_COLOR}20`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  separator: {
    height: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: Platform.OS === 'android' ? 85 : 95,
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
    lineHeight: 24,
  },
});