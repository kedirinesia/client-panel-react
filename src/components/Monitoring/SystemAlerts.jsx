import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  X, 
  Bell, 
  BellOff,
  Settings,
  Filter,
  Search,
  Clock,
  Server,
  Database,
  Wifi,
  Cpu,
  HardDrive
} from 'lucide-react';

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Generate sample alerts
  useEffect(() => {
    const alertTypes = [
      {
        type: 'error',
        title: 'High CPU Usage',
        message: 'CPU usage has exceeded 85% for the last 5 minutes',
        source: 'Server-01',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        icon: Cpu,
        color: 'red'
      },
      {
        type: 'warning',
        title: 'Memory Usage Alert',
        message: 'Memory usage is approaching 80% threshold',
        source: 'Database-02',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        icon: Server,
        color: 'yellow'
      },
      {
        type: 'info',
        title: 'Database Connection Pool',
        message: 'Connection pool utilization is at 75%',
        source: 'Database-01',
        severity: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        icon: Database,
        color: 'blue'
      },
      {
        type: 'success',
        title: 'Backup Completed',
        message: 'Daily backup completed successfully',
        source: 'Backup-Service',
        severity: 'low',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        icon: CheckCircle,
        color: 'green'
      },
      {
        type: 'error',
        title: 'Network Latency',
        message: 'Network latency has increased by 200%',
        source: 'Network-Monitor',
        severity: 'high',
        timestamp: new Date(Date.now() - 1000 * 60 * 2),
        icon: Wifi,
        color: 'red'
      },
      {
        type: 'warning',
        title: 'Disk Space',
        message: 'Disk usage is at 85% on /var/log',
        source: 'Storage-Monitor',
        severity: 'medium',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        icon: HardDrive,
        color: 'yellow'
      }
    ];

    setAlerts(alertTypes);

    // Add new alerts periodically
    const interval = setInterval(() => {
      const newAlert = {
        type: ['error', 'warning', 'info', 'success'][Math.floor(Math.random() * 4)],
        title: ['System Alert', 'Performance Issue', 'Resource Warning', 'Status Update'][Math.floor(Math.random() * 4)],
        message: 'Automated system monitoring alert',
        source: `System-${Math.floor(Math.random() * 10) + 1}`,
        severity: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
        timestamp: new Date(),
        icon: [Server, Database, Wifi, Cpu][Math.floor(Math.random() * 4)],
        color: ['red', 'yellow', 'blue', 'green'][Math.floor(Math.random() * 4)]
      };
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 19)]); // Keep last 20 alerts
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-500 bg-blue-50 border-blue-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <AlertCircle className="w-5 h-5 text-blue-500" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.type === filter;
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getAlertCounts = () => {
    return {
      total: alerts.length,
      error: alerts.filter(a => a.type === 'error').length,
      warning: alerts.filter(a => a.type === 'warning').length,
      info: alerts.filter(a => a.type === 'info').length,
      success: alerts.filter(a => a.type === 'success').length
    };
  };

  const counts = getAlertCounts();

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-4 text-center"
        >
          <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
          <div className="text-sm text-gray-600">Total Alerts</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-4 text-center"
        >
          <div className="text-2xl font-bold text-red-500">{counts.error}</div>
          <div className="text-sm text-gray-600">Errors</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-4 text-center"
        >
          <div className="text-2xl font-bold text-yellow-500">{counts.warning}</div>
          <div className="text-sm text-gray-600">Warnings</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-4 text-center"
        >
          <div className="text-2xl font-bold text-blue-500">{counts.info}</div>
          <div className="text-sm text-gray-600">Info</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="card p-4 text-center"
        >
          <div className="text-2xl font-bold text-green-500">{counts.success}</div>
          <div className="text-sm text-gray-600">Success</div>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="error">Errors</option>
              <option value="warning">Warnings</option>
              <option value="info">Info</option>
              <option value="success">Success</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                notificationsEnabled 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              <span>{notificationsEnabled ? 'Enabled' : 'Disabled'}</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={`${alert.title}-${alert.timestamp}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="card p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    {getTypeIcon(alert.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{alert.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{alert.message}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <alert.icon className="w-4 h-4" />
                        <span>{alert.source}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{alert.timestamp.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredAlerts.length === 0 && (
        <div className="card p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
          <p className="text-gray-600">
            {searchTerm || filter !== 'all' 
              ? 'No alerts match your current filters.' 
              : 'No alerts at this time. System is running smoothly.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemAlerts;
