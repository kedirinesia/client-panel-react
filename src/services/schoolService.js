import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Get school information by email
 * @param {string} email - Email address to search for
 * @returns {Promise<Object|null>} - School data or null if not found
 */
export const getSchoolByEmail = async (email) => {
  try {
    console.log('🔍 Searching for email:', email);
    
    // First, try to find in assessment_reports collection (has schoolName)
    const reportsRef = collection(db, 'assessment_reports');
    const reportsQuery = query(
      reportsRef,
      where('user.email', '==', email),
      limit(1)
    );
    
    const reportsSnapshot = await getDocs(reportsQuery);
    console.log('📋 Assessment reports results:', reportsSnapshot.size, 'documents found');
    
    if (!reportsSnapshot.empty) {
      const doc = reportsSnapshot.docs[0];
      const reportData = doc.data();
      console.log('📄 Report data found:', reportData);
      console.log('🏫 School name from report:', reportData.schoolName);
      console.log('👤 Observer name from report:', reportData.observerName);
      
      const result = {
        id: doc.id,
        email: reportData.user?.email || email,
        schoolName: reportData.schoolName || 'Unknown School',
        role: reportData.observerRole || 'user',
        name: reportData.observerName || 'Unknown User',
        isActive: true,
        ...reportData
      };
      
      console.log('✅ Final result from assessment_reports:', result);
      return result;
    }
    
    // If not found in assessment_reports, try to find in users collection
    const usersRef = collection(db, 'users');
    const usersQuery = query(
      usersRef, 
      where('email', '==', email),
      limit(1)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    console.log('📊 Users collection results:', usersSnapshot.size, 'documents found');
    
    if (!usersSnapshot.empty) {
      const doc = usersSnapshot.docs[0];
      const userData = doc.data();
      console.log('👤 User data found:', userData);
      
      const result = {
        id: doc.id,
        email: userData.email,
        schoolName: userData.schoolName || userData.name || 'Unknown School',
        role: userData.role || 'user',
        name: userData.name || userData.displayName || 'Unknown User',
        isActive: userData.isActive !== false,
        ...userData
      };
      
      console.log('✅ Final result from users:', result);
      return result;
    }
    
    console.log('❌ No data found for email:', email);
    return null;
  } catch (error) {
    console.error('Error fetching school by email:', error);
    throw error;
  }
};

/**
 * Get all schools from Firestore
 * @returns {Promise<Array>} - Array of school data
 */
export const getAllSchools = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    
    const schools = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      schools.push({
        id: doc.id,
        email: data.email,
        schoolName: data.schoolName || data.name || 'Unknown School',
        role: data.role || 'user',
        name: data.name || data.displayName || 'Unknown User',
        isActive: data.isActive !== false,
        ...data
      });
    });
    
    return schools;
  } catch (error) {
    console.error('Error fetching all schools:', error);
    throw error;
  }
};

/**
 * Check if email exists in the system
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - True if email exists
 */
export const checkEmailExists = async (email) => {
  try {
    const school = await getSchoolByEmail(email);
    return school !== null;
  } catch (error) {
    console.error('Error checking email existence:', error);
    return false;
  }
};
