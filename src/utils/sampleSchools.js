import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Sample schools data based on the assessment_reports screenshot
export const sampleSchools = [
  {
    name: 'SMK 1 Wonogiri',
    location: 'Wonogiri, Jawa Tengah',
    program: 'Teknik Ketenagalistrikan',
    grade: 'XI',
    status: 'active',
    type: 'SMK',
    students: 120,
    teachers: 15
  },
  {
    name: 'SMA Negeri 1 Jakarta',
    location: 'Jakarta Pusat',
    program: 'Teknik Komputer dan Jaringan',
    grade: 'XII',
    status: 'active',
    type: 'SMA',
    students: 200,
    teachers: 25
  },
  {
    name: 'SMK Teknologi Bandung',
    location: 'Bandung, Jawa Barat',
    program: 'Teknik Informatika',
    grade: 'X',
    status: 'pending',
    type: 'SMK',
    students: 80,
    teachers: 12
  }
];

// Function to add sample schools to Firestore
export const addSampleSchools = async () => {
  try {
    const schoolsRef = collection(db, 'assessment_reports');
    const promises = sampleSchools.map(school => 
      addDoc(schoolsRef, {
        ...school,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    );
    
    await Promise.all(promises);
    console.log('Sample schools added successfully');
    return true;
  } catch (error) {
    console.error('Error adding sample schools:', error);
    return false;
  }
};

// Function to add a single school
export const addSchool = async (schoolData) => {
  try {
    const schoolsRef = collection(db, 'assessment_reports');
    const docRef = await addDoc(schoolsRef, {
      ...schoolData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('School added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding school:', error);
    throw error;
  }
};
