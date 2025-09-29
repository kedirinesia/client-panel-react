/**
 * Utility functions for school management
 */

/**
 * Extract school name from email address
 * @param {string} email - The email address to extract from
 * @returns {string} - The extracted school name
 */
export const extractSchoolNameFromEmail = (email) => {
  if (!email) return '';
  
  // Extract domain part after @ symbol
  const domain = email.split('@')[1];
  if (!domain) return '';
  
  // Remove common domain extensions and get school name
  const schoolName = domain
    .replace(/\.(com|org|net|edu|id|co\.id|ac\.id)$/i, '') // Remove common extensions
    .replace(/[._-]/g, ' ') // Replace dots, underscores, hyphens with spaces
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
    .join(' ');
  
  return schoolName;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get school domain from email
 * @param {string} email - Email address
 * @returns {string} - School domain
 */
export const getSchoolDomain = (email) => {
  if (!email) return '';
  return email.split('@')[1] || '';
};

/**
 * Format school name for display
 * @param {string} schoolName - Raw school name
 * @returns {string} - Formatted school name
 */
export const formatSchoolName = (schoolName) => {
  if (!schoolName) return '';
  
  return schoolName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
