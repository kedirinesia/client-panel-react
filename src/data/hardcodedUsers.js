// Hardcoded users data
export const hardcodedUsers = [
  {
    id: 1,
    username: 'Helloworld123',
    password: 'Helloworld123',
    email: 'admin@adminpanel.com',
    role: 'admin',
    name: 'Administrator',
    avatar: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    lastLogin: null
  },
//   {
//     id: 2,
//     username: 'manager',
//     password: 'manager123',
//     email: 'manager@adminpanel.com',
//     role: 'manager',
//     name: 'Manager',
//     avatar: null,
//     isActive: true,
//     createdAt: new Date('2024-01-01'),
//     lastLogin: null
//   },
//   {
//     id: 3,
//     username: 'user',
//     password: 'user123',
//     email: 'user@adminpanel.com',
//     role: 'user',
//     name: 'Regular User',
//     avatar: null,
//     isActive: true,
//     createdAt: new Date('2024-01-01'),
//     lastLogin: null
//   },
//   {
//     id: 4,
//     username: 'viewer',
//     password: 'viewer123',
//     email: 'viewer@adminpanel.com',
//     role: 'viewer',
//     name: 'Viewer Only',
//     avatar: null,
//     isActive: true,
//     createdAt: new Date('2024-01-01'),
//     lastLogin: null
//   }
// ];
];

// User roles and permissions
export const userRoles = {
  admin: {
    name: 'Administrator',
    permissions: ['read', 'write', 'delete', 'export', 'manage_users'],
    description: 'Full access to all features'
  },
  manager: {
    name: 'Manager',
    permissions: ['read', 'write', 'export'],
    description: 'Can read, write and export data'
  },
  guru: {
    name: 'Guru',
    permissions: ['read', 'view_reports', 'manage_profile', 'view_schedule', 'manage_assessments'],
    description: 'Guru access to manage assessments and view reports'
  },
  user: {
    name: 'User',
    permissions: ['read', 'write'],
    description: 'Can read and write data'
  },
  viewer: {
    name: 'Viewer',
    permissions: ['read'],
    description: 'Read-only access'
  }
};

// Authentication functions
export const authenticateUser = async (email, schoolName) => {
  try {
    console.log('🔐 Starting authentication for:', email, 'with school:', schoolName);
    
    // Import the school service dynamically to avoid circular dependencies
    const { getSchoolByEmail } = await import('../services/schoolService');
    
    // Get school data from Firestore
    const schoolData = await getSchoolByEmail(email);
    console.log('📋 School data retrieved:', schoolData);
    
    if (!schoolData) {
      console.log('❌ No school data found');
      return {
        success: false,
        error: 'Email not found in the system'
      };
    }
    
    if (!schoolData.isActive) {
      console.log('❌ Account is deactivated');
      return {
        success: false,
        error: 'Account is deactivated'
      };
    }
    
    // Check if the provided school name matches (case-insensitive)
    console.log('🔍 Comparing school names:');
    console.log('  - Provided:', schoolName);
    console.log('  - Expected:', schoolData.schoolName);
    console.log('  - Match:', schoolData.schoolName.toLowerCase() === schoolName.toLowerCase());
    
    if (schoolData.schoolName.toLowerCase() !== schoolName.toLowerCase()) {
      console.log('❌ School name mismatch');
      return {
        success: false,
        error: `Invalid school name. Expected: ${schoolData.schoolName}`
      };
    }
    
    const user = {
      id: schoolData.id,
      email: schoolData.email,
      role: schoolData.role,
      name: schoolData.name,
      schoolName: schoolData.schoolName,
      avatar: schoolData.avatar || null,
      permissions: userRoles[schoolData.role]?.permissions || []
    };
    
    console.log('✅ Authentication successful:', user);
    
    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return {
      success: false,
      error: 'An error occurred during authentication'
    };
  }
};

// Check if user has permission
export const hasPermission = (user, permission) => {
  if (!user || !user.permissions) return false;
  return user.permissions.includes(permission);
};

// Get user by ID
export const getUserById = (id) => {
  return hardcodedUsers.find(u => u.id === id);
};

// Get all users (for admin)
export const getAllUsers = () => {
  return hardcodedUsers.map(user => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    name: user.name,
    isActive: user.isActive,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin
  }));
};

// Add new user (for admin)
export const addUser = (userData) => {
  const newId = Math.max(...hardcodedUsers.map(u => u.id)) + 1;
  const newUser = {
    id: newId,
    username: userData.username,
    password: userData.password,
    email: userData.email,
    role: userData.role || 'user',
    name: userData.name,
    avatar: null,
    isActive: true,
    createdAt: new Date(),
    lastLogin: null
  };
  
  hardcodedUsers.push(newUser);
  return {
    success: true,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      avatar: newUser.avatar,
      permissions: userRoles[newUser.role].permissions
    }
  };
};

// Update user (for admin)
export const updateUser = (id, userData) => {
  const userIndex = hardcodedUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }
  
  const updatedUser = {
    ...hardcodedUsers[userIndex],
    ...userData,
    id: id // Ensure ID doesn't change
  };
  
  hardcodedUsers[userIndex] = updatedUser;
  return {
    success: true,
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
      avatar: updatedUser.avatar,
      permissions: userRoles[updatedUser.role].permissions
    }
  };
};

// Delete user (for admin)
export const deleteUser = (id) => {
  const userIndex = hardcodedUsers.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return { success: false, error: 'User not found' };
  }
  
  // Don't actually delete, just deactivate
  hardcodedUsers[userIndex].isActive = false;
  return { success: true };
};

// Change password
export const changePassword = (userId, oldPassword, newPassword) => {
  const user = hardcodedUsers.find(u => u.id === userId);
  if (!user) {
    return { success: false, error: 'User not found' };
  }
  
  if (user.password !== oldPassword) {
    return { success: false, error: 'Current password is incorrect' };
  }
  
  user.password = newPassword;
  return { success: true };
};
