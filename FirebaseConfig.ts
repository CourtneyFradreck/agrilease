// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
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