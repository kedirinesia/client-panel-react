import { useState } from 'react';
import { motion } from 'framer-motion';
import { School, Plus, Database, RefreshCw } from 'lucide-react';
import { addTestAssessmentReports } from '../../utils/addTestData';

export default function SchoolsEmptyState({ onDataAdded }) {
  const [loading, setLoading] = useState(false);

  const handleAddSampleData = async () => {
    setLoading(true);
    try {
      const result = await addTestAssessmentReports();
      if (result.success) {
        console.log('Sample data added successfully:', result);
        onDataAdded();
      } else {
        console.error('Failed to add sample data:', result.error);
      }
    } catch (error) {
      console.error('Error adding sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-8"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6"
        >
          <School className="h-12 w-12 text-gray-400" />
        </motion.div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Schools Found
        </h3>
        
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          There are no schools in the assessment reports collection. 
          Add some sample data to get started or create your first school.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleAddSampleData}
            disabled={loading}
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Database className="h-4 w-4" />
            )}
            <span>
              {loading ? 'Adding Sample Data...' : 'Add Sample Schools (3)'}
            </span>
          </button>
          
          <button className="btn btn-secondary flex items-center justify-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add First School</span>
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Note:</strong> Sample data includes 3 schools with different programs and statuses 
            to demonstrate the schools management functionality.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
