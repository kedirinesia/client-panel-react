import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  BookOpen, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Target
} from 'lucide-react';
import SpiderChart from '../Charts/SpiderChart';

export default function StudentDetailModal({ isOpen, onClose, studentData, studentName }) {
  if (!isOpen || !studentData || !studentName) return null;

  const [activeTab, setActiveTab] = useState('chart');

  const getScoreLevel = (score) => {
    if (score >= 4) return { level: 'Sangat Baik', color: 'text-green-600 bg-green-100' };
    if (score >= 3) return { level: 'Baik', color: 'text-blue-600 bg-blue-100' };
    if (score >= 2) return { level: 'Cukup', color: 'text-yellow-600 bg-yellow-100' };
    return { level: 'Kurang', color: 'text-red-600 bg-red-100' };
  };

  const calculateSkillAverages = (answers) => {
    const skillScores = {
      'Kerja Sama': [],
      'Tanggung Jawab': [],
      'Komunikasi': [],
      'Problem Solving': [],
      'Kepemimpinan': [],
      'Fleksibilitas': []
    };

    Object.entries(answers).forEach(([question, answer]) => {
      const skillMatch = question.match(/\(([^)]+)\)/);
      if (skillMatch) {
        const skill = skillMatch[1];
        if (skillScores[skill]) {
          // Convert answer to score
          let score = 0;
          switch (answer) {
            case 'Sangat Baik': score = 4; break;
            case 'Baik': score = 3; break;
            case 'Cukup': score = 2; break;
            case 'Kurang': score = 1; break;
            default: score = 0;
          }
          skillScores[skill].push(score);
        }
      }
    });

    // Calculate averages
    const averages = {};
    Object.entries(skillScores).forEach(([skill, scores]) => {
      if (scores.length > 0) {
        averages[skill] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      } else {
        averages[skill] = 0;
      }
    });

    return averages;
  };

  const skillAverages = calculateSkillAverages(studentData);
  const overallAverage = Object.values(skillAverages).reduce((sum, avg) => sum + avg, 0) / Object.keys(skillAverages).length;
  const overallLevel = getScoreLevel(overallAverage);

  const formatQuestion = (question) => {
    return question.split('|')[0]?.trim() || question;
  };

  const getAnswerIcon = (answer) => {
    switch (answer) {
      case 'Sangat Baik': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Baik': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'Cukup': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'Kurang': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAnswerColor = (answer) => {
    switch (answer) {
      case 'Sangat Baik': return 'text-green-600 bg-green-100';
      case 'Baik': return 'text-blue-600 bg-blue-100';
      case 'Cukup': return 'text-yellow-600 bg-yellow-100';
      case 'Kurang': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
              className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{studentName}</h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Overall Score: {overallAverage.toFixed(2)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${overallLevel.color}`}>
                          {overallLevel.level}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 px-6">
                <nav className="flex space-x-8">
                  <button
                    onClick={() => setActiveTab('chart')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'chart'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Spider Chart
                  </button>
                  <button
                    onClick={() => setActiveTab('answers')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'answers'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <BookOpen className="h-4 w-4 inline mr-2" />
                    Detailed Answers
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'chart' && (
                  <div className="space-y-6">
                    {/* Skill Averages */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {Object.entries(skillAverages).map(([skill, average]) => {
                        const level = getScoreLevel(average);
                        return (
                          <div key={skill} className="bg-gray-50 rounded-lg p-4 text-center">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">{skill}</h4>
                            <p className="text-2xl font-bold text-gray-900 mb-1">{average.toFixed(2)}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${level.color}`}>
                              {level.level}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Spider Chart */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        Skill Assessment Radar Chart
                      </h3>
                      <SpiderChart data={skillAverages} maxValue={4} />
                    </div>
                  </div>
                )}

                {activeTab === 'answers' && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-blue-900">Assessment Summary</h3>
                      </div>
                      <p className="text-blue-800 text-sm">
                        Total assessments: {Object.keys(studentData).length} questions
                      </p>
                    </div>

                    {/* Answers by Category */}
                    {['Kerja Sama', 'Tanggung Jawab', 'Komunikasi', 'Problem Solving', 'Kepemimpinan', 'Fleksibilitas'].map(skill => {
                      const skillQuestions = Object.entries(studentData).filter(([question]) => 
                        question.includes(`(${skill})`)
                      );

                      if (skillQuestions.length === 0) return null;

                      return (
                        <div key={skill} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            {skill}
                            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {skillQuestions.length} questions
                            </span>
                          </h4>
                          <div className="space-y-3">
                            {skillQuestions.map(([question, answer], index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900 mb-1">
                                      {formatQuestion(question)}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                      {getAnswerIcon(answer)}
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAnswerColor(answer)}`}>
                                        {answer}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
