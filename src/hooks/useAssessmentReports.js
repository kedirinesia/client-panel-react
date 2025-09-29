import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  onSnapshot, 
  query
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useAssessmentReports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const collectionRef = collection(db, 'assessment_reports');
    
    const unsubscribe = onSnapshot(collectionRef, 
      (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        console.log('Assessment reports loaded:', documents);
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching assessment reports:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    data,
    loading,
    error
  };
};
