import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Function to initialize or update user count in Firestore
export const initializeUserCount = async (count = 0) => {
  try {
    const statsRef = doc(db, 'stats', 'userCount');
    await setDoc(statsRef, {
      count: count,
      lastUpdated: new Date()
    }, { merge: true });
    console.log('User count initialized:', count);
  } catch (error) {
    console.error('Error initializing user count:', error);
  }
};

// Function to get current user count
export const getUserCount = async () => {
  try {
    const statsRef = doc(db, 'stats', 'userCount');
    const docSnap = await getDoc(statsRef);
    
    if (docSnap.exists()) {
      return docSnap.data().count;
    } else {
      return 0;
    }
  } catch (error) {
    console.error('Error getting user count:', error);
    return 0;
  }
};

// Function to increment user count (call this when a new user registers)
export const incrementUserCount = async () => {
  try {
    const currentCount = await getUserCount();
    await initializeUserCount(currentCount + 1);
    return currentCount + 1;
  } catch (error) {
    console.error('Error incrementing user count:', error);
  }
};
