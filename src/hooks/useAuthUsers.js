import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { syncUserCountWithAuth, getCurrentAuthUserCount } from '../utils/dynamicAuthSync';

export const useAuthUsers = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        setCurrentUser(user);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    currentUser,
    loading,
    error
  };
};

// Hook to get total registered users count from Firestore
// This assumes you have a document at 'stats/userCount' that tracks the total
export const useUserCount = () => {
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserCount = () => {
    setLoading(true);
    const statsRef = doc(db, 'stats', 'userCount');
    
    const unsubscribe = onSnapshot(statsRef, 
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          setUserCount(docSnapshot.data().count || 0);
        } else {
          // If document doesn't exist, try to sync with Firebase Auth
          const currentCount = getCurrentAuthUserCount(); // 9 users based on latest screenshot
          setUserCount(currentCount);
          // Auto-create the document with correct count
          setDoc(statsRef, {
            count: currentCount,
            lastUpdated: serverTimestamp(),
            source: 'firebase_auth_auto_sync',
            note: 'Auto-synced with Firebase Auth'
          });
          // Also try to sync with Cloud Function for real-time data
          syncUserCountWithAuth();
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = fetchUserCount();
    return () => unsubscribe();
  }, []);

  const refetch = () => {
    fetchUserCount();
  };

  return {
    userCount,
    loading,
    error,
    refetch
  };
};
