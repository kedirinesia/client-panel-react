import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu,
  X,
  Shield,
  School,
  Calendar,
  MessageSquare
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: 'dashboard', icon: LayoutDashboard },
  { name: 'My Profile', href: 'profile', icon: User },
  { name: 'My School', href: 'schools', icon: School },
  { name: 'Reports', href: 'reports', icon: FileText },
  { name: 'Schedule', href: 'schedule', icon: Calendar },
  { name: 'Messages', href: 'messages', icon: MessageSquare },
  { name: 'Analytics', href: 'analytics', icon: BarChart3 },
  { name: 'Settings', href: 'settings', icon: Settings },
];

export default function Sidebar({ currentSection, setCurrentSection, isOpen, setIsOpen }) {
  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`sidebar-mobile ${!isOpen ? 'closed' : ''}`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 border-b border-gray-200">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-primary-600">
                <Shield className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
              </div>
              <span className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Client Portal</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1 sm:space-y-2">
            {navigation.map((item) => {
              const isActive = currentSection === item.href;
              return (
                <motion.button
                  key={item.name}
                  onClick={() => {
                    setCurrentSection(item.href);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className={`mr-2 sm:mr-3 h-3 w-3 sm:h-5 sm:w-5 ${isActive ? 'text-primary-600' : 'text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                </motion.button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs sm:text-sm font-medium text-primary-600">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">Client User</p>
                <p className="text-xs text-gray-500 truncate">client@vossa4tefa.com</p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
