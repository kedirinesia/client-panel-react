import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useUserClasses = (userEmail) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userEmail) {
      setClasses([]);
      setLoading(false);
      return;
    }

    console.log('🔍 Fetching classes for user:', userEmail);
    
    const classesRef = collection(db, 'assessment_reports');
    const classesQuery = query(
      classesRef,
      where('user.email', '==', userEmail)
    );
    
    const unsubscribe = onSnapshot(classesQuery, 
      (querySnapshot) => {
        const classData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          classData.push({
            id: doc.id,
            schoolName: data.schoolName,
            classLevel: data.classLevel,
            programKeahlian: data.programKeahlian,
            studentCount: data.studentCount,
            observerName: data.observerName,
            observerRole: data.observerRole,
            createdAt: data.createdAt,
            lastUpdated: data.lastUpdated,
            ...data
          });
        });
        
        console.log('📚 Classes loaded for user:', classData);
        setClasses(classData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching user classes:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userEmail]);

  return {
    classes,
    loading,
    error
  };
};
