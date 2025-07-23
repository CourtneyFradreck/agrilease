import { useState, useEffect } from 'react';
import { db } from '@/FirebaseConfig';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Message, Conversation } from '@/utils/types';
import { getFunctions, httpsCallable } from 'firebase/functions';

export const useMessages = (conversationId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;
  const functions = getFunctions();
  const sendNotification = httpsCallable(functions, 'sendNotification');

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'messages'),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc'),
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching messages: ', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = async (
    text: string,
    receiverId: string,
    convId: string,
  ) => {
    if (!currentUserId || !convId) return;

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId: convId,
        senderId: currentUserId,
        receiverId,
        text,
        timestamp: serverTimestamp(),
        isRead: false,
      });

      // Also update the conversation's last message
      const conversationRef = doc(db, 'conversations', convId);
      await updateDoc(conversationRef, {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp(),
        lastMessageSenderId: currentUserId,
        [`unreadMessages.${receiverId}`]: increment(1),
      });
      
      await sendNotification({
        targetUserId: receiverId,
        title: 'New Message',
        body: text,
        data: { conversationId: convId },
      });

    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  return { messages, loading, sendMessage };
};