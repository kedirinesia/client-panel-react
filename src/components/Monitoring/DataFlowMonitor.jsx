import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowDown, 
  ArrowUp, 
  Database, 
  Cloud, 
  Smartphone, 
  Monitor,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react';

const DataFlowMonitor = () => {
  const [dataFlow, setDataFlow] = useState({
    incoming: 0,
    outgoing: 0,
    processing: 0,
    queued: 0,
    errors: 0,
    success: 0
  });

  const [flowEvents, setFlowEvents] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulate data flow events
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now(),
        type: Math.random() > 0.1 ? 'success' : 'error',
        source: ['mobile', 'web', 'api'][Math.floor(Math.random() * 3)],
        destination: ['database', 'cloud', 'cache'][Math.floor(Math.random() * 3)],
        timestamp: new Date(),
        size: Math.floor(Math.random() * 1000) + 100,
        duration: Math.floor(Math.random() * 500) + 50
      };

      setFlowEvents(prev => [newEvent, ...prev.slice(0, 19)]); // Keep last 20 events

      setDataFlow(prev => ({
        incoming: prev.incoming + (Math.random() * 10),
        outgoing: prev.outgoing + (Math.random() * 8),
        processing: Math.floor(Math.random() * 5),
        queued: Math.floor(Math.random() * 10),
        errors: prev.errors + (newEvent.type === 'error' ? 1 : 0),
        success: prev.success + (newEvent.type === 'success' ? 1 : 0)
      }));

      setIsProcessing(true);
      setTimeout(() => setIsProcessing(false), 200);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const getSourceIcon = (source) => {
    switch (source) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'web': return <Monitor className="w-4 h-4" />;
      case 'api': return <Cloud className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getDestinationIcon = (destination) => {
    switch (destination) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'cloud': return <Cloud className="w-4 h-4" />;
      case 'cache': return <RefreshCw className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Data Flow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Data Flow</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-500">Live</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowDown className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">Incoming</span>
              </div>
              <span className="font-semibold text-green-600">
                {formatBytes(dataFlow.incoming * 1024)}/s
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Outgoing</span>
              </div>
              <span className="font-semibold text-blue-600">
                {formatBytes(dataFlow.outgoing * 1024)}/s
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Processing</span>
              </div>
              <span className="font-semibold text-yellow-600">
                {dataFlow.processing}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Status</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Queued Requests</span>
              <span className="font-semibold text-gray-900">{dataFlow.queued}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (dataFlow.queued / 20) * 100)}%` }}
              ></div>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Queue Health</span>
              <span className={`font-medium ${
                dataFlow.queued > 15 ? 'text-red-500' : 
                dataFlow.queued > 10 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {dataFlow.queued > 15 ? 'High' : dataFlow.queued > 10 ? 'Medium' : 'Good'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rate</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success</span>
              <span className="font-semibold text-green-600">{dataFlow.success}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Errors</span>
              <span className="font-semibold text-red-600">{dataFlow.errors}</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${dataFlow.success + dataFlow.errors > 0 ? 
                    (dataFlow.success / (dataFlow.success + dataFlow.errors)) * 100 : 0}%` 
                }}
              ></div>
            </div>
            
            <div className="text-center">
              <span className="text-2xl font-bold text-gray-900">
                {dataFlow.success + dataFlow.errors > 0 ? 
                  Math.round((dataFlow.success / (dataFlow.success + dataFlow.errors)) * 100) : 0}%
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Flow Visualization */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Data Flow Visualization</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sources */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 text-center">Sources</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Mobile Apps</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-3 bg-green-50 rounded-lg">
                <Monitor className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Web Apps</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-3 bg-purple-50 rounded-lg">
                <Cloud className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">API Calls</span>
              </div>
            </div>
          </div>

          {/* Processing Center */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 text-center">Processing</h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <RefreshCw className={`w-8 h-8 text-white ${isProcessing ? 'animate-spin' : ''}`} />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{dataFlow.processing}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-xs text-gray-500">{dataFlow.processing} active</p>
              </div>
            </div>
          </div>

          {/* Destinations */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-700 text-center">Destinations</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
                <Database className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium">Database</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Cloud className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Cloud Storage</span>
              </div>
              <div className="flex items-center justify-center space-x-2 p-3 bg-yellow-50 rounded-lg">
                <RefreshCw className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">Cache</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Data Flow Events */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Data Flow Events</h3>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {flowEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  {getSourceIcon(event.source)}
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  {getDestinationIcon(event.destination)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {event.source} → {event.destination}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(event.size)} • {event.duration}ms
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {event.timestamp.toLocaleTimeString()}
                </span>
                {event.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataFlowMonitor;
