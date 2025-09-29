import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Eye, TrendingUp } from 'lucide-react';

export default function MyStudents({ userClasses, onClassClick }) {
  const [selectedClass, setSelectedClass] = useState(null);

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(timestamp).toLocaleDateString('id-ID');
  };

  const handleClassClick = (classData) => {
    setSelectedClass(classData);
    if (onClassClick) {
      onClassClick(classData);
    }
  };

  if (!userClasses || userClasses.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">My Students</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-sm font-medium text-gray-900">No classes found</h3>
          <p className="text-sm text-gray-500">You don't have any classes assigned yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">My Students</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Users className="h-4 w-4" />
          <span>{userClasses.reduce((total, classData) => total + (classData.studentCount || 0), 0)} students</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {userClasses.slice(0, 5).map((classData, index) => (
          <motion.div
            key={classData.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
            onClick={() => handleClassClick(classData)}
          >
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {getInitials(classData.classLevel || 'Class')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {classData.classLevel} - {classData.programKeahlian}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span className="truncate">{classData.studentCount || 0} students</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span>{formatDate(classData.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-600 mt-1">
                <Eye className="h-3 w-3" />
                <span>View details</span>
              </div>
            </div>
          </motion.div>
        ))}
        
        {userClasses.length > 5 && (
          <div className="text-center pt-2">
            <p className="text-sm text-gray-500">
              And {userClasses.length - 5} more classes...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
