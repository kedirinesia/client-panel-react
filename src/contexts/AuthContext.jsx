import { createContext, useContext, useState, useEffect } from 'react';
import { authenticateUser } from '../data/hardcodedUsers';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('clientPortalUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('clientPortalUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, schoolName) => {
    try {
      console.log('🔐 AuthContext: Starting login for:', email, schoolName);
      const result = await authenticateUser(email, schoolName);
      console.log('📋 AuthContext: Authentication result:', result);
      
      if (result.success) {
        console.log('✅ AuthContext: Setting user:', result.user);
        setUser(result.user);
        localStorage.setItem('clientPortalUser', JSON.stringify(result.user));
        return { success: true };
      } else {
        console.log('❌ AuthContext: Authentication failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('clientPortalUser');
  };

  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };

  const isClient = () => {
    return user && user.role === 'client';
  };

  const isSchoolAdmin = () => {
    return user && user.role === 'school_admin';
  };

  const isTeacher = () => {
    return user && user.role === 'teacher';
  };

  const isStudent = () => {
    return user && user.role === 'student';
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    isClient,
    isSchoolAdmin,
    isTeacher,
    isStudent,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
