
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { Conversation, User } from '@/utils/types';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BORDER_RADIUS = 8;

interface ConversationItemProps {
  item: Conversation;
  currentUserId: string;
}

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
    return messageDate.format('ddd');
  }
  return messageDate.format('MMM D, YYYY');
};

export default function ConversationItem({
  item,
  currentUserId,
}: ConversationItemProps) {
  const router = useRouter();
  const [otherUser, setOtherUser] = useState<User | null>(null);

  const otherParticipantId = item.participants.find(
    (p) => p !== currentUserId,
  );

  useEffect(() => {
    if (otherParticipantId) {
      const userRef = doc(db, 'users', otherParticipantId);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          setOtherUser({ id: docSnap.id, ...docSnap.data() } as User);
        }
      });
    }
  }, [otherParticipantId]);

  const unreadCount = item.unreadMessages?.[currentUserId] || 0;

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
        <Text style={styles.conversationName}>
          {otherUser?.name || 'Loading...'}
        </Text>
        <Text
          style={[styles.lastMessage, unreadCount > 0 && styles.unreadLastMessage]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.messageTime}>
          {formatTimestamp(item.lastMessageTimestamp)}
        </Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    padding: 15,
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS,
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
});
