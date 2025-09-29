import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportAssessmentReportExcel, exportToPDF, exportComprehensivePDF } from '../../utils/exportData';
import { 
  X, 
  School, 
  Users, 
  Calendar, 
  User, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  FileSpreadsheet
} from 'lucide-react';

export default function SchoolDetailModal({ school, isOpen, onClose }) {
  const [exportLoading, setExportLoading] = useState(false);
  
  if (!school) return null;

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getScoreColor = (score) => {
    if (score >= 4) return 'text-green-600 bg-green-100';
    if (score >= 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return 'Baik';
    if (score >= 3) return 'Cukup';
    return 'Kurang';
  };

  const getAnswerLabel = (answer) => {
    const answerMap = {
      'Sangat Baik': { color: 'text-green-600 bg-green-100', icon: CheckCircle },
      'Baik': { color: 'text-blue-600 bg-blue-100', icon: CheckCircle },
      'Cukup': { color: 'text-yellow-600 bg-yellow-100', icon: AlertCircle },
      'Kurang': { color: 'text-red-600 bg-red-100', icon: AlertCircle }
    };
    return answerMap[answer] || { color: 'text-gray-600 bg-gray-100', icon: Info };
  };

  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const result = exportAssessmentReportExcel(school, `assessment_report_${school.id}`);
      if (result.success) {
        console.log('Excel export successful');
      } else {
        console.error('Excel export failed:', result.error);
      }
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setExportLoading(true);
    try {
      const result = exportComprehensivePDF([school], `comprehensive_assessment_report_${school.id}`);
      if (result.success) {
        console.log('Comprehensive PDF export successful');
      } else {
        console.error('PDF export failed:', result.error);
      }
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    } finally {
      setExportLoading(false);
    }
  };

  const renderStudentData = () => {
    if (!school.studentScores || !school.answers) return null;

    const students = Object.keys(school.studentScores);
    
    return students.map((studentId, index) => {
      const scores = school.studentScores[studentId];
      const answers = school.answers[studentId];
      
      return (
        <div key={studentId} className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Siswa {index + 1}: {studentId}
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Scores */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Skor Numerik
              </h5>
              <div className="space-y-2">
                {Object.entries(scores).map(([skill, score]) => (
                  <div key={skill} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{skill}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                      {score} ({getScoreLabel(score)})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Answers */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Jawaban Kualitatif
              </h5>
              <div className="space-y-2">
                {Object.entries(answers).map(([skill, answer]) => {
                  const answerConfig = getAnswerLabel(answer);
                  const Icon = answerConfig.icon;
                  return (
                    <div key={skill} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{skill}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${answerConfig.color}`}>
                        <Icon className="h-3 w-3 mr-1" />
                        {answer}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderAISuggestions = () => {
    if (!school.aiSuggestions || school.aiSuggestions.length === 0) return null;

    return (
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
          Saran AI
        </h4>
        <div className="space-y-3">
          {school.aiSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <School className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Detail Assessment Report
                  </h2>
                  <p className="text-sm text-gray-500">
                    {school.schoolName} - {school.programKeahlian}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportPDF}
                  disabled={exportLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download PDF Report"
                >
                  {exportLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <span>{exportLoading ? 'Exporting...' : 'Download Comprehensive PDF'}</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exportLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download Excel Report"
                >
                  {exportLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FileSpreadsheet className="h-4 w-4" />
                  )}
                  <span>{exportLoading ? 'Exporting...' : 'Download Excel'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* School Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <School className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">Sekolah</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{school.schoolName}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Jumlah Siswa</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{school.studentCount}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Kelas</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {school.classLevel} {school.programKeahlian}
                  </p>
                </div>
              </div>

              {/* Observer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2 text-gray-600" />
                  Informasi Observer
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Nama Observer:</span>
                    <p className="font-medium text-gray-900">{school.observerName}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Peran:</span>
                    <p className="font-medium text-gray-900">{school.observerRole}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Program Keahlian:</span>
                    <p className="font-medium text-gray-900">{school.programKeahlian}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Versi:</span>
                    <p className="font-medium text-gray-900">{school.version}</p>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">Dibuat:</span>
                  <p className="font-medium text-gray-900">{formatDate(school.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm text-gray-600">Terakhir Diupdate:</span>
                  <p className="font-medium text-gray-900">{formatDate(school.uploadedAt)}</p>
                </div>
              </div>

              {/* AI Suggestions */}
              {renderAISuggestions()}

              {/* Student Data */}
              {renderStudentData()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
