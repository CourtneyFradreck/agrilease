// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Test function to verify database connection
export async function testDatabaseConnection() {
  try {
    // Try to add a test document
    const testCollection = collection(db, 'test');
    const testDoc = await addDoc(testCollection, {
      message: 'Test connection',
      timestamp: new Date()
    });
    console.log('Test document written with ID: ', testDoc.id);

    // Try to read from the collection
    const querySnapshot = await getDocs(testCollection);
    console.log('Successfully read from database. Documents found:', querySnapshot.size);
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

export { db };