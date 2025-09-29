import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  User,
  School,
  Clock,
  FileText,
  BarChart3,
  Download,
  Loader2
} from 'lucide-react';
import BarChart from '../Charts/BarChart';
import StudentDetailModal from './StudentDetailModal';
import { downloadClassPDF } from '../../services/pdfService';

export default function ClassDetailModal({ isOpen, onClose, classData }) {
  if (!isOpen || !classData) return null;

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(timestamp).toLocaleDateString('id-ID');
  };

  const getScoreLevel = (score) => {
    if (score >= 4) return { level: 'Sangat Baik', color: 'text-green-600 bg-green-100' };
    if (score >= 3) return { level: 'Baik', color: 'text-blue-600 bg-blue-100' };
    if (score >= 2) return { level: 'Cukup', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'Kurang', color: 'text-red-600 bg-red-100' };
  };

  const calculateAverageScore = (studentScores) => {
    if (!studentScores) return 0;
    
    const allScores = [];
    Object.values(studentScores).forEach(student => {
      Object.values(student).forEach(score => {
        if (typeof score === 'number') {
          allScores.push(score);
        }
      });
    });
    
    if (allScores.length === 0) return 0;
    return (allScores.reduce((sum, score) => sum + score, 0) / allScores.length).toFixed(2);
  };

  const getSkillCategories = () => {
    const categories = {
      'Kerja Sama': [],
      'Tanggung Jawab': [],
      'Komunikasi': [],
      'Problem Solving': [],
      'Kepemimpinan': [],
      'Fleksibilitas': []
    };

    if (classData.studentScores) {
      Object.values(classData.studentScores).forEach(student => {
        Object.entries(student).forEach(([key, score]) => {
          const category = key.split('|')[1]?.split('(')[1]?.replace(')', '') || 'Other';
          if (categories[category]) {
            categories[category].push(score);
          }
        });
      });
    }

    return Object.entries(categories).map(([name, scores]) => ({
      name,
      average: scores.length > 0 ? (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2) : 0,
      count: scores.length
    }));
  };

  const handleStudentClick = (studentName, studentData) => {
    setSelectedStudent({ name: studentName, data: studentData });
    setIsStudentModalOpen(true);
  };

  const handleCloseStudentModal = () => {
    setIsStudentModalOpen(false);
    setSelectedStudent(null);
  };

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      await downloadClassPDF(classData);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Gagal mengunduh PDF. Silakan coba lagi.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const skillCategories = getSkillCategories();
  const averageScore = calculateAverageScore(classData.studentScores);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <School className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {classData.classLevel} - {classData.programKeahlian}
                      </h2>
                      <p className="text-sm text-gray-600">{classData.schoolName}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleDownloadPDF}
                      disabled={downloadingPDF}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {downloadingPDF ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span>{downloadingPDF ? 'Mengunduh...' : 'Download PDF'}</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Total Students</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{classData.studentCount || 0}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Average Score</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{averageScore}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Observer</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{classData.observerName}</p>
                    <p className="text-sm text-gray-600">{classData.observerRole}</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Created Date</span>
                    </div>
                    <p className="text-gray-900">{formatDate(classData.createdAt)}</p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Last Updated</span>
                    </div>
                    <p className="text-gray-900">{formatDate(classData.lastUpdated)}</p>
                  </div>
                </div>

                {/* Skill Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Class Skill Assessment Results
                  </h3>
                  
                  {/* Bar Chart */}
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-4 text-center">
                      Average Skills by Category
                    </h4>
                    <BarChart data={skillCategories.reduce((acc, skill) => {
                      acc[skill.name] = parseFloat(skill.average);
                      return acc;
                    }, {})} maxValue={4} />
                  </div>

                  {/* Skill Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {skillCategories.map((skill, index) => {
                      const scoreLevel = getScoreLevel(parseFloat(skill.average));
                      return (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{skill.name}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${scoreLevel.color}`}>
                              {scoreLevel.level}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-900">{skill.average}</span>
                            <span className="text-sm text-gray-500">{skill.count} assessments</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Suggestions */}
                {classData.aiSuggestions && classData.aiSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      AI Recommendations
                    </h3>
                    <div className="space-y-3">
                      {classData.aiSuggestions.map((suggestion, index) => (
                        <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-gray-800">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student List */}
                {classData.answers && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Student Assessment Summary
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(classData.answers).map(([studentName, answers]) => {
                        const studentScores = classData.studentScores?.[studentName] || {};
                        const totalScore = Object.values(studentScores).reduce((sum, score) => sum + (typeof score === 'number' ? score : 0), 0);
                        const averageStudentScore = Object.keys(studentScores).length > 0 ? (totalScore / Object.keys(studentScores).length).toFixed(2) : 0;
                        const studentLevel = getScoreLevel(parseFloat(averageStudentScore));
                        
                        return (
                          <div 
                            key={studentName} 
                            className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => handleStudentClick(studentName, answers)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{studentName}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Average: {averageStudentScore}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${studentLevel.color}`}>
                                  {studentLevel.level}
                                </span>
                              </div>
                            </div>
                            <div className="text-sm text-gray-600">
                              {Object.keys(answers).length} assessments completed
                            </div>
                            <div className="text-xs text-blue-600 mt-2">
                              Click to view detailed assessment and spider chart
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        isOpen={isStudentModalOpen}
        onClose={handleCloseStudentModal}
        studentData={selectedStudent?.data}
        studentName={selectedStudent?.name}
      />
    </AnimatePresence>
  );
}
