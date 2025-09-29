import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { 
  Users, 
  BarChart3, 
  TrendingUp,
  UserCheck,
  Clock
} from 'lucide-react';

// Components
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import StatsCard from './components/Dashboard/StatsCard';
import MyStudents from './components/Dashboard/MyStudents';
import UsersTable from './components/Users/UsersTable';
import SchoolsTable from './components/Schools/SchoolsTable';
import MonitoringDashboard from './components/Monitoring/MonitoringDashboard';
import ClassDetailModal from './components/Modals/ClassDetailModal';

// Hooks
import { useFirestore } from './hooks/useFirestore';
import { useUserCount } from './hooks/useAuthUsers';
import { useAssessmentReports } from './hooks/useAssessmentReports';
import { useUserClasses } from './hooks/useUserClasses';


function AppContent() {
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Firestore hooks
  const { 
    data: users, 
    loading: usersLoading, 
    addDocument: addUser,
    updateDocument: updateUser,
    deleteDocument: deleteUser
  } = useFirestore('users');

  const { 
    data: assessmentReports, 
    loading: reportsLoading
  } = useAssessmentReports();

  const { 
    classes: userClasses, 
    loading: classesLoading
  } = useUserClasses(user?.email);

  const { 
    deleteDocument: deleteAssessmentReport
  } = useFirestore('assessment_reports');

  const { 
    userCount, 
    loading: userCountLoading,
    refetch: refetchUserCount
  } = useUserCount();



  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle add user
  const handleAddUser = async (userData) => {
    try {
      await addUser(userData);
      showNotification('User added successfully!', 'success');
    } catch (error) {
      showNotification('Failed to add user', 'error');
      throw error;
    }
  };

  // Handle edit user
  const handleEditUser = async (user) => {
    try {
      // For now, just show a notification
      showNotification(`Edit user: ${user.name || user.email}`, 'info');
      // TODO: Implement edit modal
    } catch (error) {
      showNotification('Failed to edit user', 'error');
    }
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name || user.email}?`)) {
      try {
        await deleteUser(user.id);
        showNotification('User deleted successfully!', 'success');
      } catch (error) {
        showNotification('Failed to delete user', 'error');
      }
    }
  };

  // Handle class click
  const handleClassClick = (classData) => {
    setSelectedClass(classData);
    setIsClassModalOpen(true);
  };

  // Handle close class modal
  const handleCloseClassModal = () => {
    setIsClassModalOpen(false);
    setSelectedClass(null);
  };

  // Handle delete school
  const handleDeleteSchool = async (school) => {
    try {
      await deleteAssessmentReport(school.id);
      showNotification('School deleted successfully!', 'success');
    } catch (error) {
      showNotification('Failed to delete school', 'error');
      throw error;
    }
  };

  // Calculate stats
  const totalStudents = userClasses.reduce((total, classData) => total + (classData.studentCount || 0), 0);
  const stats = {
    totalUsers: totalStudents, // Total students dari kelas yang diampu
    activeUsers: userClasses.length // Jumlah kelas yang diampu
  };

  // Render current section
  const renderSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatsCard
                title="My Students"
                value={stats.totalUsers}
                change="12"
                changeType="increase"
                icon={Users}
                color="blue"
                delay={0}
              />
              <StatsCard
                title="My Classes"
                value={stats.activeUsers}
                change="2"
                changeType="increase"
                icon={UserCheck}
                color="green"
                delay={0.1}
              />
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent School Activities</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">New student enrolled</p>
                        <p className="text-xs text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Assessment report generated</p>
                        <p className="text-xs text-gray-500">5 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">System backup completed</p>
                        <p className="text-xs text-gray-500">1 day ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <MyStudents 
                  userClasses={userClasses}
                  onClassClick={handleClassClick}
                />
                
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">School Status</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">System Status</span>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Data Sync</span>
                      <span className="badge badge-success">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reports</span>
                      <span className="badge badge-success">Up to date</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Backup</span>
                      <span className="badge badge-success">Today</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Profile</h3>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-primary-600">C</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{user?.name || 'Client User'}</h4>
                  <p className="text-gray-600">{user?.email || 'client@vossa4tefa.com'}</p>
                  <p className="text-sm text-gray-500">{user?.role || 'Client'} • {user?.schoolName || 'Vossa4Tefa School'}</p>
                </div>
              </div>
              <div className="border-t pt-6">
                <p className="text-gray-600">Profile management features coming soon...</p>
              </div>
            </div>
          </div>
        );

      case 'schools':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My School Information</h3>
            
            {/* School Info */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">School Name</label>
                  <p className="mt-1 text-gray-900">{user?.schoolName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Role</label>
                  <p className="mt-1 text-gray-900">{user?.role || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Total Classes</label>
                  <p className="mt-1 text-gray-900">{userClasses?.length || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className="badge badge-success">Active</span>
                </div>
              </div>
            </div>

            {/* Classes List */}
            <div className="border-t pt-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">My Classes</h4>
              
              {classesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading classes...</span>
                </div>
              ) : userClasses && userClasses.length > 0 ? (
                <div className="space-y-4">
                  {userClasses.map((classData, index) => (
                    <div 
                      key={classData.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleClassClick(classData)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">
                            {classData.classLevel} - {classData.programKeahlian}
                          </h5>
                          <p className="text-sm text-gray-600">
                            {classData.schoolName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {classData.studentCount} students • Created: {new Date(classData.createdAt?.seconds * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">No classes found</h3>
                  <p className="text-sm text-gray-500">You don't have any classes assigned yet.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports & Documents</h3>
            <p className="text-gray-600">Access to school reports and documents coming soon...</p>
          </div>
        );

      case 'schedule':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">School Schedule</h3>
            <p className="text-gray-600">Schedule and calendar features coming soon...</p>
          </div>
        );

      case 'messages':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages & Notifications</h3>
            <p className="text-gray-600">Messaging system coming soon...</p>
          </div>
        );

      case 'analytics':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        );

      case 'settings':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-screen bg-gray-50 flex overflow-hidden">
        <Sidebar
          currentSection={currentSection}
          setCurrentSection={setCurrentSection}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            currentSection={currentSection}
          />

          <main className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>


        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 50, x: 50 }}
              className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
                notification.type === 'success' ? 'bg-green-500 text-white' :
                notification.type === 'error' ? 'bg-red-500 text-white' :
                notification.type === 'info' ? 'bg-blue-500 text-white' :
                'bg-gray-500 text-white'
              }`}
            >
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Class Detail Modal */}
        <ClassDetailModal
          isOpen={isClassModalOpen}
          onClose={handleCloseClassModal}
          classData={selectedClass}
        />
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;