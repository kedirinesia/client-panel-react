import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Server, 
  Database, 
  Cpu,
  HardDrive,
  Wifi,
  BarChart3,
  PieChart as PieChartIcon
} from 'lucide-react';

const PerformanceCharts = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [chartData, setChartData] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});

  // Generate sample data
  useEffect(() => {
    const generateData = () => {
      const data = [];
      const now = new Date();
      const intervals = {
        '1h': 5, // 5 minutes
        '6h': 30, // 30 minutes
        '24h': 60, // 1 hour
        '7d': 360 // 6 hours
      };
      
      const interval = intervals[timeRange] * 60 * 1000; // Convert to milliseconds
      const points = timeRange === '1h' ? 12 : timeRange === '6h' ? 12 : timeRange === '24h' ? 24 : 28;
      
      for (let i = points; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - (i * interval));
        data.push({
          time: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: timestamp.getTime(),
          cpu: Math.max(0, Math.min(100, 50 + Math.random() * 40 + Math.sin(i * 0.5) * 20)),
          memory: Math.max(0, Math.min(100, 60 + Math.random() * 30 + Math.cos(i * 0.3) * 15)),
          disk: Math.max(0, Math.min(100, 40 + Math.random() * 20 + Math.sin(i * 0.7) * 10)),
          network: Math.max(0, Math.min(100, 30 + Math.random() * 50 + Math.cos(i * 0.4) * 25)),
          requests: Math.floor(Math.random() * 1000) + 100,
          errors: Math.floor(Math.random() * 20),
          responseTime: Math.max(50, Math.random() * 500 + 100)
        });
      }
      
      return data;
    };

    setChartData(generateData());

    // Update system metrics
    setSystemMetrics({
      avgCpu: Math.round(chartData.reduce((sum, d) => sum + d.cpu, 0) / chartData.length) || 0,
      avgMemory: Math.round(chartData.reduce((sum, d) => sum + d.memory, 0) / chartData.length) || 0,
      totalRequests: chartData.reduce((sum, d) => sum + d.requests, 0),
      totalErrors: chartData.reduce((sum, d) => sum + d.errors, 0),
      avgResponseTime: Math.round(chartData.reduce((sum, d) => sum + d.responseTime, 0) / chartData.length) || 0
    });

    // Update data periodically
    const interval = setInterval(() => {
      setChartData(prev => {
        const newData = [...prev];
        const now = new Date();
        
        // Add new data point
        newData.push({
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: now.getTime(),
          cpu: Math.max(0, Math.min(100, 50 + Math.random() * 40)),
          memory: Math.max(0, Math.min(100, 60 + Math.random() * 30)),
          disk: Math.max(0, Math.min(100, 40 + Math.random() * 20)),
          network: Math.max(0, Math.min(100, 30 + Math.random() * 50)),
          requests: Math.floor(Math.random() * 1000) + 100,
          errors: Math.floor(Math.random() * 20),
          responseTime: Math.max(50, Math.random() * 500 + 100)
        });
        
        // Keep only last 25 points
        return newData.slice(-25);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange]);

  const pieData = [
    { name: 'CPU', value: systemMetrics.avgCpu, color: '#3B82F6' },
    { name: 'Memory', value: systemMetrics.avgMemory, color: '#10B981' },
    { name: 'Disk', value: 45, color: '#F59E0B' },
    { name: 'Network', value: 30, color: '#EF4444' }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          <div className="flex space-x-2">
            {['1h', '6h', '24h', '7d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-4 text-center"
          >
            <Cpu className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.avgCpu}%</div>
            <div className="text-sm text-gray-600">Avg CPU</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-4 text-center"
          >
            <Server className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.avgMemory}%</div>
            <div className="text-sm text-gray-600">Avg Memory</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-4 text-center"
          >
            <Activity className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.totalRequests}</div>
            <div className="text-sm text-gray-600">Total Requests</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-4 text-center"
          >
            <Database className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.totalErrors}</div>
            <div className="text-sm text-gray-600">Total Errors</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-4 text-center"
          >
            <Wifi className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{systemMetrics.avgResponseTime}ms</div>
            <div className="text-sm text-gray-600">Avg Response</div>
          </motion.div>
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU and Memory Chart */}
          <div className="card p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">CPU & Memory Usage</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="CPU %"
                />
                <Line 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Memory %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Network and Disk Chart */}
          <div className="card p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Network & Disk Usage</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="network" 
                  stackId="1" 
                  stroke="#EF4444" 
                  fill="#EF4444"
                  fillOpacity={0.6}
                  name="Network %"
                />
                <Area 
                  type="monotone" 
                  dataKey="disk" 
                  stackId="1" 
                  stroke="#F59E0B" 
                  fill="#F59E0B"
                  fillOpacity={0.6}
                  name="Disk %"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Requests Chart */}
          <div className="card p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Request Volume</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="requests" fill="#8B5CF6" name="Requests" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Resource Distribution */}
          <div className="card p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resource Distribution</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="card p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trend</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="responseTime" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;
