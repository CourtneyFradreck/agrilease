import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';
const BORDER_RADIUS = 8;

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount?: number;
}

const mockConversations: Conversation[] = [
  {
    id: 'JohnDoe',
    name: 'John Doe',
    lastMessage: 'Regarding the tractor, it will be available from 28th.',
    timestamp: dayjs().subtract(2, 'hour').toDate(),
    unreadCount: 1,
  },
  {
    id: 'JaneSmith',
    name: 'Jane Smith',
    lastMessage: 'Confirming pickup for the harvester tomorrow morning.',
    timestamp: dayjs().subtract(1, 'day').toDate(),
  },
  {
    id: 'AgriCorpSupport',
    name: 'AgriCorp Support',
    lastMessage: 'Your payment for equipment ID #123 was successful.',
    timestamp: dayjs().subtract(3, 'day').toDate(),
  },
  {
    id: 'FarmTechSolutions',
    name: 'Farm Tech Solutions',
    lastMessage: 'New irrigation pumps just arrived! Check them out.',
    timestamp: dayjs().subtract(1, 'week').toDate(),
  },
];

export default function MessagesInboxScreen() {
  const router = useRouter();

  const formatTimestamp = (date: Date): string => {
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

  const renderConversationItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => router.push(`/messages/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.avatarPlaceholder}>
        <MaterialIcons name="person" size={30} color={HEADER_TEXT_COLOR} />
      </View>
      <View style={styles.conversationTextContent}>
        <Text style={styles.conversationName}>{item.name}</Text>
        <Text
          style={[
            styles.lastMessage,
            item.unreadCount && styles.unreadLastMessage,
          ]}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      <View style={styles.rightContent}>
        <Text style={styles.messageTime}>
          {formatTimestamp(item.timestamp)}
        </Text>
        {item.unreadCount && item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={mockConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  header: {
    backgroundColor: MAIN_COLOR,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    paddingBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BACKGROUND,
    padding: 15,
    borderRadius: BORDER_RADIUS,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_GREY,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 15,
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
