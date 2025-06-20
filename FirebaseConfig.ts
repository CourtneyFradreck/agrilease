import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import { Platform } from 'react-native';

// Import Auth, but not the persistence function yet
import { initializeAuth, getAuth, Auth } from "firebase/auth"; 

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCENPFsckjW3Jem0e6srw1QQ31fcJ7TW-I",
  authDomain: "agrilease-37add.firebaseapp.com",
  projectId: "agrilease-37add",
  storageBucket: "agrilease-37add.firebasestorage.app",
  messagingSenderId: "410364585643",
  appId: "1:410364585643:web:d9ca02802f8a06907879ee",
  measurementId: "G-LL4BP62G5H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- THE FIX: Conditionally initialize Auth for Native vs. Web ---
let auth: Auth;

if (Platform.OS === 'web') {
    // For web, we use getAuth
    auth = getAuth(app);
} else {
    // For React Native, we use initializeAuth with a dynamic require
    // This is the magic that fixes the "module not found" error
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
}
// -------------------------------------------------------------------

let analytics;
if (Platform.OS !== 'web') {
    isSupported().then(supported => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
} else {
    analytics = getAnalytics(app);
}

// Test function (no changes needed)
export async function testDatabaseConnection() {
  try {
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, { message: 'Test connection', timestamp: new Date() });
    console.log('Test document written with ID: ', testDoc.id);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export { db, auth, analytics };