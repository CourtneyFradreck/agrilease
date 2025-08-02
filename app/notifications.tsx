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
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
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

export default function NotificationsScreen() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(firestore, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleNotificationPress = (notification) => {
    if (notification.data?.bookingId) {
      router.push(`/booking/requests`);
    } else if (notification.data?.conversationId) {
      router.push(`/messages/${notification.data.conversationId}`);
    }
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.notificationItemRead : {},
      ]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <Text
          style={[styles.notificationTitle, item.read ? styles.textRead : {}]}
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
        <Text
          style={[
            styles.notificationTimestamp,
            item.read ? styles.textRead : {},
          ]}
        >
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#4D7C0F" />;
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
              Your latest updates and alerts
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
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateTitle}>No Notifications Yet</Text>
          <Text style={styles.emptyStateText}>
            Looks like you're all caught up!
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
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: BORDER_RADIUS,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  notificationItemRead: {
    backgroundColor: CARD_BACKGROUND,
    borderColor: BORDER_GREY,
    opacity: 0.8,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 4,
  },
  notificationMessage: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 4,
  },
  notificationTimestamp: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
  },
  textRead: {
    color: TEXT_SECONDARY_GREY,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    marginTop: Platform.OS === 'android' ? 85 : 95,
    paddingBottom: Platform.OS === 'ios' ? 70 : 65,
  },
  emptyStateTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: TEXT_PRIMARY_DARK,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
    textAlign: 'center',
  },
});
