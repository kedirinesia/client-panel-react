import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Activity, 
  AlertTriangle, 
  BarChart3,
  RefreshCw,
  Settings,
  Download,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Import monitoring components
import RealTimeStats from './RealTimeStats';
import DataFlowMonitor from './DataFlowMonitor';
import SystemAlerts from './SystemAlerts';
import PerformanceCharts from './PerformanceCharts';

const MonitoringDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Monitor },
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'dataflow', label: 'Data Flow', icon: Activity },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle }
  ];

  // Auto refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // Trigger refresh of all monitoring components
      window.dispatchEvent(new CustomEvent('monitoring-refresh'));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setLastRefresh(new Date());
    window.dispatchEvent(new CustomEvent('monitoring-refresh'));
  };

  const handleExport = () => {
    // Export monitoring data
    const data = {
      timestamp: new Date().toISOString(),
      tab: activeTab,
      refreshInterval,
      autoRefresh
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monitoring-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <RealTimeStats />;
      case 'performance':
        return <PerformanceCharts />;
      case 'dataflow':
        return <DataFlowMonitor />;
      case 'alerts':
        return <SystemAlerts />;
      default:
        return <RealTimeStats />;
    }
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''} transition-all duration-300`}>
      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Monitor className="w-6 h-6 text-blue-500" />
              <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live Monitoring</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Auto Refresh Toggle */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Auto Refresh</span>
              </label>
            </div>

            {/* Refresh Interval */}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>

            {/* Last Refresh Time */}
            <div className="text-sm text-gray-500">
              Last: {lastRefresh.toLocaleTimeString()}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>

              <button
                onClick={handleExport}
                className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
              </button>

              <button className="flex items-center space-x-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="card p-2 mb-6">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTabContent()}
      </motion.div>

      {/* Footer Status */}
      <div className="card p-4 mt-6">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Database Connected</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>API Healthy</span>
            </div>
          </div>
          
          <div className="text-gray-500">
            Monitoring Dashboard v1.0 • Last updated: {lastRefresh.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
