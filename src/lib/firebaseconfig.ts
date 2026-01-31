import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyBiqPRzpjPn4XXKtyZ57N8v5eZUAqUsKDk",
  authDomain: "skpmw-1b00d.firebaseapp.com",
  projectId: "skpmw-1b00d",
  storageBucket: "skpmw-1b00d.firebasestorage.app",
  messagingSenderId: "673021213930",
  appId: "1:673021213930:web:c906453f4ef2ea4b1beb93",
  measurementId: "G-HZ8BRDK81F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export {app, db, auth};