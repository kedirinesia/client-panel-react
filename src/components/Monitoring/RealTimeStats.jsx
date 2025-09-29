import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Database, 
  Server, 
  Wifi, 
  WifiOff,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const RealTimeStats = () => {
  const [stats, setStats] = useState({
    onlineUsers: 0,
    totalRequests: 0,
    responseTime: 0,
    errorRate: 0,
    databaseConnections: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    storageUsed: 0
  });

  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => ({
        onlineUsers: Math.max(0, prevStats.onlineUsers + (Math.random() - 0.5) * 10),
        totalRequests: prevStats.totalRequests + Math.floor(Math.random() * 5),
        responseTime: Math.max(50, prevStats.responseTime + (Math.random() - 0.5) * 20),
        errorRate: Math.max(0, Math.min(100, prevStats.errorRate + (Math.random() - 0.5) * 2)),
        databaseConnections: Math.max(0, prevStats.databaseConnections + (Math.random() - 0.5) * 3),
        memoryUsage: Math.max(0, Math.min(100, prevStats.memoryUsage + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.max(0, Math.min(100, prevStats.cpuUsage + (Math.random() - 0.5) * 8)),
        storageUsed: Math.max(0, Math.min(100, prevStats.storageUsed + (Math.random() - 0.5) * 1))
      }));
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusColor = (value, thresholds) => {
    if (value <= thresholds.good) return 'text-green-500';
    if (value <= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIcon = (value, thresholds) => {
    if (value <= thresholds.good) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (value <= thresholds.warning) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <AlertCircle className="w-4 h-4 text-red-500" />;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const statsCards = [
    {
      title: 'Online Users',
      value: Math.floor(stats.onlineUsers),
      icon: Users,
      color: 'blue',
      trend: stats.onlineUsers > 0 ? 'up' : 'down',
      status: 'good'
    },
    {
      title: 'Total Requests',
      value: stats.totalRequests.toLocaleString(),
      icon: Activity,
      color: 'green',
      trend: 'up',
      status: 'good'
    },
    {
      title: 'Response Time',
      value: `${Math.floor(stats.responseTime)}ms`,
      icon: Server,
      color: stats.responseTime > 500 ? 'red' : stats.responseTime > 200 ? 'yellow' : 'green',
      trend: stats.responseTime > 500 ? 'down' : 'up',
      status: stats.responseTime > 500 ? 'critical' : stats.responseTime > 200 ? 'warning' : 'good'
    },
    {
      title: 'Error Rate',
      value: `${stats.errorRate.toFixed(1)}%`,
      icon: AlertCircle,
      color: stats.errorRate > 5 ? 'red' : stats.errorRate > 2 ? 'yellow' : 'green',
      trend: stats.errorRate > 5 ? 'down' : 'up',
      status: stats.errorRate > 5 ? 'critical' : stats.errorRate > 2 ? 'warning' : 'good'
    },
    {
      title: 'DB Connections',
      value: Math.floor(stats.databaseConnections),
      icon: Database,
      color: 'purple',
      trend: 'up',
      status: 'good'
    },
    {
      title: 'Memory Usage',
      value: `${stats.memoryUsage.toFixed(1)}%`,
      icon: Server,
      color: stats.memoryUsage > 80 ? 'red' : stats.memoryUsage > 60 ? 'yellow' : 'green',
      trend: stats.memoryUsage > 80 ? 'down' : 'up',
      status: stats.memoryUsage > 80 ? 'critical' : stats.memoryUsage > 60 ? 'warning' : 'good'
    },
    {
      title: 'CPU Usage',
      value: `${stats.cpuUsage.toFixed(1)}%`,
      icon: Activity,
      color: stats.cpuUsage > 80 ? 'red' : stats.cpuUsage > 60 ? 'yellow' : 'green',
      trend: stats.cpuUsage > 80 ? 'down' : 'up',
      status: stats.cpuUsage > 80 ? 'critical' : stats.cpuUsage > 60 ? 'warning' : 'good'
    },
    {
      title: 'Storage Used',
      value: `${stats.storageUsed.toFixed(1)}%`,
      icon: Database,
      color: stats.storageUsed > 90 ? 'red' : stats.storageUsed > 70 ? 'yellow' : 'green',
      trend: stats.storageUsed > 90 ? 'down' : 'up',
      status: stats.storageUsed > 90 ? 'critical' : stats.storageUsed > 70 ? 'warning' : 'good'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-5 h-5 text-green-500" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-500" />
          )}
          <span className={`font-medium ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
            {isOnline ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(stat.value, { good: 50, warning: 80 })}
                {stat.trend === 'up' ? (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <p className={`text-2xl font-bold text-${stat.color}-600`}>
                {stat.value}
              </p>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full bg-${stat.color}-500 animate-pulse`}></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Health Overview */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className={`text-sm font-medium ${getStatusColor(stats.responseTime, { good: 200, warning: 500 })}`}>
                  {Math.floor(stats.responseTime)}ms
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stats.responseTime > 500 ? 'bg-red-500' : 
                    stats.responseTime > 200 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (stats.responseTime / 1000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Resources</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Memory Usage</span>
                <span className={`text-sm font-medium ${getStatusColor(stats.memoryUsage, { good: 60, warning: 80 })}`}>
                  {stats.memoryUsage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stats.memoryUsage > 80 ? 'bg-red-500' : 
                    stats.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${stats.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Reliability</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className={`text-sm font-medium ${getStatusColor(stats.errorRate, { good: 2, warning: 5 })}`}>
                  {stats.errorRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    stats.errorRate > 5 ? 'bg-red-500' : 
                    stats.errorRate > 2 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, stats.errorRate * 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeStats;
