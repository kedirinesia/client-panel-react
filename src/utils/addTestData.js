import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Function to add test data to assessment_reports
export const addTestAssessmentReports = async () => {
  try {
    const assessmentRef = collection(db, 'assessment_reports');
    
    const testData = [
      {
        schoolName: 'SMK 1 Wonogiri',
        location: 'Wonogiri, Jawa Tengah',
        program: 'Teknik Ketenagalistrikan',
        grade: 'XI',
        status: 'active',
        type: 'SMK',
        students: 120,
        teachers: 15,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        schoolName: 'SMA Negeri 1 Jakarta',
        location: 'Jakarta Pusat',
        program: 'Teknik Komputer dan Jaringan',
        grade: 'XII',
        status: 'active',
        type: 'SMA',
        students: 200,
        teachers: 25,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        schoolName: 'SMK Teknologi Bandung',
        location: 'Bandung, Jawa Barat',
        program: 'Teknik Informatika',
        grade: 'X',
        status: 'pending',
        type: 'SMK',
        students: 80,
        teachers: 12,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    const promises = testData.map(data => addDoc(assessmentRef, data));
    const docRefs = await Promise.all(promises);
    
    console.log('Test data added successfully:', docRefs.map(ref => ref.id));
    return { success: true, count: docRefs.length };
  } catch (error) {
    console.error('Error adding test data:', error);
    return { success: false, error: error.message };
  }
};

// Function to check if assessment_reports collection exists and has data
export const checkAssessmentReports = async () => {
  try {
    const assessmentRef = collection(db, 'assessment_reports');
    const snapshot = await getDocs(assessmentRef);
    
    console.log('Assessment reports check:', {
      exists: !snapshot.empty,
      count: snapshot.size,
      docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    });
    
    return {
      exists: !snapshot.empty,
      count: snapshot.size,
      docs: snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }))
    };
  } catch (error) {
    console.error('Error checking assessment reports:', error);
    return { exists: false, count: 0, docs: [], error: error.message };
  }
};
