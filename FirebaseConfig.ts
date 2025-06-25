import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { Platform } from 'react-native';

export const firebaseConfig = {
  apiKey: 'AIzaSyCENPFsckjW3Jem0e6srw1QQ31fcJ7TW-I',
  authDomain: 'agrilease-37add.firebaseapp.com',
  projectId: 'agrilease-37add',
  storageBucket: 'agrilease-37add.firebasestorage.app',
  messagingSenderId: '410364585643',
  appId: '1:410364585643:web:d9ca02802f8a06907879ee',
  measurementId: 'G-LL4BP62G5H',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  const { getReactNativePersistence } = require('firebase/auth');
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}

let analytics;
if (Platform.OS !== 'web') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
} else {
  analytics = getAnalytics(app);
}

export async function testDatabaseConnection() {
  try {
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      message: 'Test connection',
      timestamp: new Date(),
    });
    console.log('Test document written with ID: ', testDoc.id);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export { analytics, auth, db };
