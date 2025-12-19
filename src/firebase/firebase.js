// src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"; // ✅ Make sure this line is EXACT
import { getDatabase } from "firebase/database";

// Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2mQNeygEwdWFCnHJnw9wlqHWKmXlfe38",
  authDomain: "taptap-377d9.firebaseapp.com",
  databaseURL: "https://taptap-377d9-default-rtdb.firebaseio.com",
  projectId: "taptap-377d9",
  storageBucket: "taptap-377d9.firebasestorage.app",
  messagingSenderId: "146364410143",
  appId: "1:146364410143:web:3ce902bdcaeb954091682a",
  measurementId: "G-LRJ2TK7CDH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Database
const auth = getAuth(app);
const db = getDatabase(app);

// Google Sign-In
const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
