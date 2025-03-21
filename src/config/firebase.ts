import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuCs6Bj3MDoHYU9XtD72qoOHFAGmwfoWs",
  authDomain: "ecosattva-b2d24.firebaseapp.com",
  projectId: "ecosattva-b2d24",
  storageBucket: "ecosattva-b2d24.firebasestorage.app",
  messagingSenderId: "952060798708",
  appId: "1:952060798708:web:103496b2b148e4f59ee0a1",
};

// Log Firebase config for debugging
console.log("Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google auth provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Add scopes for additional permissions
googleProvider.addScope('profile');
googleProvider.addScope('email');

export { auth, googleProvider }; 