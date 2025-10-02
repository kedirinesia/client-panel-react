import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  ChevronDown,
  Sun,
  Moon,
  LogOut,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ onMenuClick, currentSection }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();

  const sectionTitles = {
    dashboard: 'Dashboard',
    profile: 'My Profile',
    schools: 'My School',
    reports: 'Reports & Documents',
    schedule: 'School Schedule',
    messages: 'Messages',
    analytics: 'Analytics',
    settings: 'Settings'
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="bg-white border-b border-gray-200 layout-responsive py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
          <button
            onClick={onMenuClick}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 lg:hidden flex-shrink-0"
          >
            <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="min-w-0 flex-1">
            <h1 className="text-responsive-xl font-bold text-gray-900 truncate">
              {sectionTitles[currentSection] || 'Dashboard'}
            </h1>
            <p className="text-responsive-xs text-gray-500 hidden sm:block">
              Welcome back! Here's what's happening with your school.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Search - Desktop only */}
          <div className="hidden md:block relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-48 lg:w-64"
            />
          </div>

          {/* Mobile search button */}
          <button className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 sm:hidden">
            <Search className="h-4 w-4 text-gray-600" />
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            ) : (
              <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <button className="relative p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <User className="h-3 w-3 sm:h-4 sm:w-4 text-primary-600" />
              </div>
              <div className="hidden md:block text-left min-w-0">
                <p className="text-responsive-xs font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize truncate">{user?.role || 'User'}</p>
              </div>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <div className="px-3 sm:px-4 py-2 border-b border-gray-100">
                  <p className="text-responsive-xs font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button className="w-full px-3 sm:px-4 py-2 text-left text-responsive-xs text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full px-3 sm:px-4 py-2 text-left text-responsive-xs text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
