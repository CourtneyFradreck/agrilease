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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import dayjs from 'dayjs';
import { getAuth } from 'firebase/auth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/FirebaseConfig';
import { useMessages } from '@/hooks/useMessages';
import { Message } from '@/utils/types';

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

export default function MessageScreen() {
  const router = useRouter();
  const { id: otherUserId, conversationId: initialConversationId } =
    useLocalSearchParams<{ id: string; conversationId?: string }>();

  const [conversationId, setConversationId] = useState(initialConversationId);
  const [isFindingConversation, setIsFindingConversation] = useState(true);
  const [newMessageText, setNewMessageText] = useState('');
  const [otherUserName, setOtherUserName] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  const {
    messages,
    loading: messagesLoading,
    sendMessage: sendMessageHook,
  } = useMessages(conversationId || '');

  useEffect(() => {
    const fetchOtherUserName = async () => {
      if (!otherUserId) return;
      const userDocRef = doc(db, 'users', otherUserId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setOtherUserName(userDocSnap.data().name);
      } else {
        setOtherUserName('Unknown User');
      }
    };

    fetchOtherUserName();
  }, [otherUserId]);

  useEffect(() => {
    const findOrCreateConversation = async () => {
      if (!currentUserId || !otherUserId) return;

      if (initialConversationId) {
        setConversationId(initialConversationId);
        setIsFindingConversation(false);
        return;
      }

      setIsFindingConversation(true);
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', currentUserId),
      );

      const querySnapshot = await getDocs(q);
      let existingConversationId: string | null = null;

      querySnapshot.forEach((doc) => {
        const conversation = doc.data();
        if (conversation.participants.includes(otherUserId)) {
          existingConversationId = doc.id;
        }
      });

      if (existingConversationId) {
        setConversationId(existingConversationId);
      }
      setIsFindingConversation(false);
    };

    findOrCreateConversation();
  }, [currentUserId, otherUserId, initialConversationId]);

  useEffect(() => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessageText.trim() === '' || !currentUserId || !otherUserId) {
      Alert.alert('Error', 'Could not send message.');
      return;
    }

    let convId = conversationId;
    if (!convId) {
      const newConversationRef = await addDoc(collection(db, 'conversations'), {
        participants: [currentUserId, otherUserId],
        lastMessage: newMessageText.trim(),
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: currentUserId,
        unreadMessages: { [otherUserId]: 1 },
      });
      convId = newConversationRef.id;
      setConversationId(convId);
    }

    await sendMessageHook(newMessageText.trim(), otherUserId, convId);
    setNewMessageText('');
  };

  const renderMessageBubble = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUserId;
    const messageTime = item.timestamp
      ? dayjs((item.timestamp as any).toDate()).format('h:mm A')
      : '';

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

  if (isFindingConversation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text>Starting conversation...</Text>
      </View>
    );
  }

  if (messagesLoading && !messages.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={MAIN_COLOR} />
        <Text>Loading messages...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{otherUserName || 'Chat'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageBubble}
        keyExtractor={(item) => item.id || Math.random().toString()}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});