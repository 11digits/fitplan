import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseConfig = {
  apiKey: "AIzaSyAyyAI5qGInXZTwm7GBGVWswmUMaaTHXJw",
  authDomain: "fitplan-3773f.firebaseapp.com",
  projectId: "fitplan-3773f",
  storageBucket: "fitplan-3773f.firebasestorage.app",
  messagingSenderId: "162954027428",
  appId: "1:162954027428:web:64e18340344c101713e131",
  databaseURL: "https://fitplan-3773f-default-rtdb.europe-west1.firebasedatabase.app/"
};


const app = initializeApp(firebaseConfig)
getAuth(app)
getDatabase(app)
