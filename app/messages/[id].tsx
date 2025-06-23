import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';

const { width, height } = Dimensions.get('window');

const BORDER_RADIUS = 8;
const MAIN_COLOR = '#4D7C0F';
const HEADER_TEXT_COLOR = '#FFFFFF';
const TEXT_PRIMARY_DARK = '#1F2937';
const TEXT_SECONDARY_GREY = '#6B7280';
const BACKGROUND_LIGHT_GREY = '#F9FAFB';
const CARD_BACKGROUND = '#FFFFFF';
const BORDER_GREY = '#E5E5E5';

const SENDER_BUBBLE_COLOR = MAIN_COLOR;
const RECEIVER_BUBBLE_COLOR = '#E5E7EB';
const SENDER_TEXT_COLOR = '#FFFFFF';
const RECEIVER_TEXT_COLOR = TEXT_PRIMARY_DARK;

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Date;
}

const myUserId = 'user123';

const mockConversationMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'otherUser456',
    receiverId: myUserId,
    text: 'Hi there! Is the John Deere 6100R available for rent next week?',
    timestamp: dayjs().subtract(2, 'hour').toDate(),
  },
  {
    id: 'm2',
    senderId: myUserId,
    receiverId: 'otherUser456',
    text: 'Hello! Yes, it should be. Which days are you looking at?',
    timestamp: dayjs().subtract(1, 'hour').toDate(),
  },
  {
    id: 'm3',
    senderId: 'otherUser456',
    receiverId: myUserId,
    text: 'Great! I need it from June 28th to July 5th. What are the rates for that period?',
    timestamp: dayjs().subtract(30, 'minute').toDate(),
  },
  {
    id: 'm4',
    senderId: myUserId,
    receiverId: 'otherUser456',
    text: 'For those dates, it would be $150 per day. I can confirm availability for you now if you like.',
    timestamp: dayjs().subtract(5, 'minute').toDate(),
  },
];

export default function MessageScreen() {
  const router = useRouter();
  // The ID could be a userId or a conversationId
  const { id } = useLocalSearchParams<{ id: string }>();

  const conversationPartnerName = id || 'Unknown User';

  const [messages, setMessages] = useState<Message[]>(mockConversationMessages);
  const [newMessageText, setNewMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessageText.trim() === '') {
      Alert.alert('Empty Message', 'Please type a message before sending.');
      return;
    }

    const newMessage: Message = {
      id: `m${messages.length + 1}`,
      senderId: myUserId,
      receiverId: id || 'otherUser456',
      text: newMessageText.trim(),
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setNewMessageText('');
    console.log('Sending message:', newMessage);
  };

  const renderMessageBubble = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === myUserId;
    const messageTime = dayjs(item.timestamp).format('h:mm A');

    return (
      <View
        style={[
          styles.messageBubbleContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTimestamp,
              isMyMessage
                ? styles.myMessageTimestamp
                : styles.otherMessageTimestamp,
            ]}
          >
            {messageTime}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.fullScreenContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back to previous screen"
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={HEADER_TEXT_COLOR}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{conversationPartnerName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageBubble}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesListContent}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainerWrapper}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.messageInput}
            placeholder="Type your message..."
            placeholderTextColor={TEXT_SECONDARY_GREY}
            value={newMessageText}
            onChangeText={setNewMessageText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            disabled={newMessageText.trim() === ''}
            accessibilityLabel="Send message"
          >
            <MaterialIcons
              name="send"
              size={24}
              color={
                newMessageText.trim() === '' ? BORDER_GREY : CARD_BACKGROUND
              }
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: BACKGROUND_LIGHT_GREY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 35 : 0,
    paddingBottom: 10,
    backgroundColor: MAIN_COLOR,
    minHeight: Platform.OS === 'android' ? 80 : 60,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Archivo-Bold',
    fontSize: 18,
    color: HEADER_TEXT_COLOR,
  },
  messagesListContent: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BORDER_RADIUS,
    flexDirection: 'column',
  },
  myMessageBubble: {
    backgroundColor: SENDER_BUBBLE_COLOR,
    borderBottomRightRadius: 2,
  },
  otherMessageBubble: {
    backgroundColor: RECEIVER_BUBBLE_COLOR,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontFamily: 'Archivo-Regular',
    fontSize: 15,
    marginBottom: 4,
  },
  myMessageText: {
    color: SENDER_TEXT_COLOR,
  },
  otherMessageText: {
    color: RECEIVER_TEXT_COLOR,
  },
  messageTimestamp: {
    fontFamily: 'Archivo-Regular',
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  myMessageTimestamp: {
    color: SENDER_TEXT_COLOR + 'B3',
  },
  otherMessageTimestamp: {
    color: TEXT_SECONDARY_GREY,
  },
  inputContainerWrapper: {
    backgroundColor: CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: BORDER_GREY,
    paddingHorizontal: 10,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BACKGROUND_LIGHT_GREY,
    borderRadius: BORDER_RADIUS * 2,
    paddingHorizontal: 10,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: BORDER_GREY,
  },
  messageInput: {
    flex: 1,
    fontFamily: 'Archivo-Regular',
    fontSize: 16,
    color: TEXT_PRIMARY_DARK,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    lineHeight: 20,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: MAIN_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
