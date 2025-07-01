import { useState, useEffect } from 'react';
import { db } from '@/FirebaseConfig';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Conversation } from '@/utils/types';

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', currentUserId),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const convos: Conversation[] = [];
      querySnapshot.forEach((doc) => {
        convos.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(convos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  return { conversations, loading };
};
