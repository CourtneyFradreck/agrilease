import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  FlatList,
} from 'react-native';
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

const mockNotifications = [
  {
    id: '1',
    title: 'Booking Confirmed',
    message: 'Your recent equipment rental has been approved.',
    timestamp: '2025-06-25T10:00:00Z',
    read: false,
  },
  {
    id: '2',
    title: 'New Message',
    message: 'You have a new message regarding your listing.',
    timestamp: '2025-06-25T09:30:00Z',
    read: false,
  },
  {
    id: '3',
    title: 'Rental Reminder',
    message: 'Your rental period ends tomorrow. Please prepare for return.',
    timestamp: '2025-06-24T18:00:00Z',
    read: false,
  },
  {
    id: '4',
    title: 'New Review',
    message: 'A new review has been posted on one of your listings.',
    timestamp: '2025-06-24T14:15:00Z',
    read: true,
  },
  {
    id: '5',
    title: 'Payment Successful',
    message: 'Your recent payment has been processed.',
    timestamp: '2025-06-23T11:45:00Z',
    read: true,
  },
  {
    id: '6',
    title: 'App Update Available',
    message: 'A new version of the app is available with new features.',
    timestamp: '2025-06-22T08:00:00Z',
    read: true,
  },
];

export default function NotificationsScreen() {
  const handleNotificationPress = (notificationId: string) => {
    console.log('Notification pressed:', notificationId);
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        item.read ? styles.notificationItemRead : {},
      ]}
      onPress={() => handleNotificationPress(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text
          style={[styles.notificationTitle, item.read ? styles.textRead : {}]}
        >
          {item.title}
        </Text>
        <Text
          style={[styles.notificationMessage, item.read ? styles.textRead : {}]}
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

      {mockNotifications.length > 0 ? (
        <FlatList
          data={mockNotifications}
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
