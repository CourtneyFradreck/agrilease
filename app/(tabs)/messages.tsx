import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { useConversations } from '@/hooks/useConversations';
import { Conversation } from '@/utils/types';
import { getAuth } from 'firebase/auth';

const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BORDER_RADIUS = 8;

export default function MessagesInboxScreen() {
  const router = useRouter();
  const { conversations, loading } = useConversations();
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const formatTimestamp = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = dayjs();
    const messageDate = dayjs(date);

    if (now.isSame(messageDate, 'day')) {
      return messageDate.format('h:mm A');
    }
    if (now.subtract(1, 'day').isSame(messageDate, 'day')) {
      return 'Yesterday';
    }
    if (now.diff(messageDate, 'day') < 7) {
      return messageDate.format('ddd'); // Mon, Tue, etc.
    }
    return messageDate.format('MMM D, YYYY');
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const otherParticipantId = item.participants.find(
      (p) => p !== currentUserId
    );

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() =>
          router.push(`/messages/${otherParticipantId}?conversationId=${item.id}`)
        }
        activeOpacity={0.8}
      >
        <View style={styles.avatarPlaceholder}>
          <MaterialIcons name="person" size={30} color={HEADER_TEXT_COLOR} />
        </View>
        <View style={styles.conversationTextContent}>
          <Text style={styles.conversationName}>{otherParticipantId}</Text>
          <Text
            style={[
              styles.lastMessage,
              item.unreadMessages &&
                item.unreadMessages[currentUserId || ''] > 0 &&
                styles.unreadLastMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.messageTime}>
            {formatTimestamp(item.lastMessageTimestamp)}
          </Text>
          {item.unreadMessages && item.unreadMessages[currentUserId || ''] > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadMessages[currentUserId || '']}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Messages</Text>
          <Text style={styles.headerDescription}>
            Your conversations and notifications
          </Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id!}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
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
  headerContent: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 10,
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
  listContent: {
    paddingTop:
      Platform.OS === 'android' ? 85 : 95 /* Adjusted for header height */,
    paddingVertical: 10,
    paddingHorizontal: 18 /* Consistent padding */,
    marginTop: 10,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    padding: 15,
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
    borderWidth: 1, // Kept for definition
    borderColor: BORDER_GREY, // Subtle border
    shadowColor: 'transparent', // Removed shadow for flat design
    shadowOffset: { width: 0, height: 0 }, // Removed shadow for flat design
    shadowOpacity: 0, // Removed shadow for flat design
    shadowRadius: 0, // Removed shadow for flat design
    elevation: 0, // Removed elevation for flat design
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS, // Consistent border radius
    backgroundColor: MAIN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  conversationTextContent: {
    flex: 1,
  },
  conversationName: {
    fontFamily: 'Archivo-Bold',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    marginBottom: 2,
  },
  lastMessage: {
    fontFamily: 'Archivo-Regular',
    fontSize: 14,
    color: TEXT_SECONDARY_GREY,
  },
  unreadLastMessage: {
    fontFamily: 'Archivo-Medium',
    color: TEXT_PRIMARY_DARK,
  },
  rightContent: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  messageTime: {
    fontFamily: 'Archivo-Regular',
    fontSize: 12,
    color: TEXT_SECONDARY_GREY,
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: MAIN_COLOR,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  unreadText: {
    fontFamily: 'Archivo-Bold',
    fontSize: 12,
    color: HEADER_TEXT_COLOR,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: TEXT_SECONDARY_GREY,
  },
});