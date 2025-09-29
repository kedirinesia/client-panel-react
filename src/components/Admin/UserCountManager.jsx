import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Minus, RefreshCw } from 'lucide-react';
import { setUserCount, incrementUserCount, getCurrentUserCount, initializeWithRealData, syncUserCountFromAuth } from '../../utils/manageUserCount';

export default function UserCountManager({ currentCount, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [customCount, setCustomCount] = useState('');

  const handleIncrement = async () => {
    setLoading(true);
    try {
      await incrementUserCount();
      onUpdate();
    } catch (error) {
      console.error('Error incrementing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetCustom = async () => {
    if (!customCount || isNaN(customCount)) return;
    
    setLoading(true);
    try {
      await setUserCount(parseInt(customCount));
      setCustomCount('');
      onUpdate();
    } catch (error) {
      console.error('Error setting custom count:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromAuth = async () => {
    setLoading(true);
    try {
      await syncUserCountFromAuth();
      onUpdate();
    } catch (error) {
      console.error('Error syncing from auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeReal = async () => {
    setLoading(true);
    try {
      await initializeWithRealData();
      onUpdate();
    } catch (error) {
      console.error('Error initializing real data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <Users className="h-6 w-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">User Count Manager</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <span className="text-sm text-gray-600">Current Count:</span>
          <span className="text-2xl font-bold text-blue-600">{currentCount}</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSyncFromAuth}
            disabled={loading}
            className="btn btn-primary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sync from Auth</span>
          </button>
          
          <button
            onClick={handleInitializeReal}
            disabled={loading}
            className="btn btn-secondary flex items-center justify-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>Set Real Data (7)</span>
          </button>
        </div>

        <div className="flex space-x-2">
          <input
            type="number"
            value={customCount}
            onChange={(e) => setCustomCount(e.target.value)}
            placeholder="Enter custom count"
            className="input flex-1"
          />
          <button
            onClick={handleSetCustom}
            disabled={loading || !customCount}
            className="btn btn-primary"
          >
            Set
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-2">
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Updating...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
