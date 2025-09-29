import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBokvn8siwW11KOxqc3bWb6-M_zRZbWEao",
  authDomain: "vossa4tefa.firebaseapp.com",
  projectId: "vossa4tefa",
  storageBucket: "vossa4tefa.firebasestorage.app",
  messagingSenderId: "1020671239792",
  appId: "1:1020671239792:android:748fa31f34fb84409f76b5",
  databaseURL: "https://vossa4tefa-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
