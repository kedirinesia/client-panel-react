import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  School, 
  MapPin, 
  Calendar, 
  Users, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import SchoolsEmptyState from './SchoolsEmptyState';
import SchoolDetailModal from './SchoolDetailModal';
import DeleteConfirmationModal from '../Modals/DeleteConfirmationModal';
import { exportComprehensivePDF } from '../../utils/exportData';

export default function SchoolsTable({ schools = [], loading = false, onDataAdded, onDeleteSchool }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Debug logging
  console.log('SchoolsTable received:', { schools, loading, schoolsLength: schools.length });

  const extractSchoolInfo = (schoolId) => {
    // Extract school info from document ID like "smk_1_wonogiri_xi_teknik_ketenagalistrikan"
    const parts = schoolId.split('_');
    if (parts.length >= 3) {
      const schoolName = parts.slice(0, -2).join(' ').replace(/\b\w/g, l => l.toUpperCase());
      const grade = parts[parts.length - 2];
      const program = parts[parts.length - 1].replace(/\b\w/g, l => l.toUpperCase());
      return { schoolName, grade, program };
    }
    return { schoolName: schoolId, grade: 'N/A', program: 'N/A' };
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (date.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return new Date(date).toLocaleDateString('id-ID');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-gray-100 text-gray-800', label: 'Inactive' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Filter schools based on search term and status
  const filteredSchools = schools.filter(school => {
    // Extract school info from document ID or use existing fields
    const { schoolName, grade, program } = extractSchoolInfo(school.id);
    
    const matchesSearch = schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.schoolName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         school.program?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || school.status === filterStatus;
    
    const result = matchesSearch && matchesFilter;
    
    // Debug each school filtering
    console.log('Filtering school:', {
      id: school.id,
      schoolName,
      program,
      schoolData: school,
      matchesSearch,
      matchesFilter,
      result
    });
    
    return result;
  });

  // Debug logging for filtered schools
  console.log('Filtered schools:', { 
    filteredSchools, 
    filteredLength: filteredSchools.length,
    searchTerm, 
    filterStatus 
  });

  const handleSchoolClick = (school) => {
    setSelectedSchool(school);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSchool(null);
  };

  const handleDeleteClick = (school, e) => {
    e.stopPropagation();
    setSchoolToDelete(school);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!schoolToDelete || !onDeleteSchool) return;
    
    setDeleteLoading(true);
    try {
      await onDeleteSchool(schoolToDelete);
      setDeleteModalOpen(false);
      setSchoolToDelete(null);
    } catch (error) {
      console.error('Error deleting school:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSchoolToDelete(null);
  };

  const handleExportAllPDF = async () => {
    setExportLoading(true);
    try {
      const result = exportComprehensivePDF(schools, 'comprehensive_all_schools_report');
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


  if (loading) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <School className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Schools Management</h2>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleExportAllPDF}
              disabled={exportLoading || schools.length === 0}
              className="btn btn-secondary flex items-center space-x-2"
            >
              {exportLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>{exportLoading ? 'Exporting...' : 'Export All PDF'}</span>
            </button>
            <button className="btn btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add School</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search schools, locations, or programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-32"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {schools.length === 0 ? (
          <SchoolsEmptyState onDataAdded={onDataAdded} />
        ) : filteredSchools.length === 0 ? (
          <div className="p-8 text-center">
            <School className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'No schools found matching your criteria' 
                : 'No schools found'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kelas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSchools.map((school, index) => {
                const { schoolName, grade, program } = extractSchoolInfo(school.id);
                return (
                  <motion.tr
                    key={school.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleSchoolClick(school)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <School className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {schoolName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {school.location || 'No location'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{grade} {program}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(school.status || 'active')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(school.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button 
                          className="text-blue-600 hover:text-blue-900 p-1"
                          onClick={() => handleSchoolClick(school)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 p-1" 
                          title="Delete"
                          onClick={(e) => handleDeleteClick(school, e)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {filteredSchools.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {filteredSchools.length} of {schools.length} schools
            </p>
            <div className="flex items-center space-x-2">
              <button className="btn btn-ghost text-sm">Previous</button>
              <button className="btn btn-ghost text-sm">Next</button>
            </div>
          </div>
        </div>
      )}

      {/* School Detail Modal */}
      <SchoolDetailModal
        school={selectedSchool}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete School"
        message="Are you sure you want to delete this school? All associated data will be permanently removed."
        itemName={schoolToDelete ? extractSchoolInfo(schoolToDelete.id).schoolName : ""}
        loading={deleteLoading}
      />
    </motion.div>
  );
}
        