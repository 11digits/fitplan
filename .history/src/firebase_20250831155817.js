import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'


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
