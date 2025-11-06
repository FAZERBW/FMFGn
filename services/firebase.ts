import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "fitting-prince-auto-part.firebaseapp.com",
  databaseURL: "https://fitting-prince-auto-part-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fitting-prince-auto-part",
  storageBucket: "fitting-prince-auto-part.firebasestorage.app",
  messagingSenderId: "633238377315",
  appId: "1:633238377315:web:88ad3f55df2be3d1393956",
  measurementId: "G-NSPSNZ9XN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);