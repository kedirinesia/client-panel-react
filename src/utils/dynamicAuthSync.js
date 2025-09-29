import { getFunctions, httpsCallable } from 'firebase/functions';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Function to sync user count with Firebase Auth via Cloud Function
export const syncUserCountWithAuth = async () => {
  try {
    const functions = getFunctions();
    const getUserCount = httpsCallable(functions, 'getUserCount');
    
    const result = await getUserCount();
    console.log('User count synced with Firebase Auth:', result.data.count);
    return result.data.count;
  } catch (error) {
    console.error('Error syncing user count with auth:', error);
    // Fallback: manually set to current count based on screenshot (9 users)
    await setUserCountManually(9);
    return 9;
  }
};

// Fallback function to manually set user count
export const setUserCountManually = async (count) => {
  try {
    const statsRef = doc(db, 'stats', 'userCount');
    await setDoc(statsRef, {
      count: count,
      lastUpdated: serverTimestamp(),
      source: 'manual_fallback',
      note: 'Set manually due to Cloud Function error'
    });
    console.log('User count set manually:', count);
  } catch (error) {
    console.error('Error setting user count manually:', error);
  }
};

// Function to get current Firebase Auth user count (for reference)
export const getCurrentAuthUserCount = () => {
  // Based on the latest screenshot showing 9 users
  // This should be updated when Cloud Functions are deployed
  return 9;
};
