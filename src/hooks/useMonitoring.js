import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit, 
  where,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export const useMonitoring = () => {
  const [monitoringData, setMonitoringData] = useState({
    users: {
      total: 0,
      active: 0,
      newToday: 0,
      online: 0
    },
    system: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0
    },
    performance: {
      responseTime: 0,
      requests: 0,
      errors: 0,
      successRate: 0
    },
    alerts: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Monitor users collection
  const monitorUsers = useCallback(() => {
    const usersQuery = query(collection(db, 'users'));
    
    return onSnapshot(usersQuery, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      setMonitoringData(prev => ({
        ...prev,
        users: {
          total: users.length,
          active: users.filter(user => user.status === 'active').length,
          newToday: users.filter(user => {
            const userDate = user.createdAt?.toDate();
            return userDate && userDate >= today;
          }).length,
          online: users.filter(user => {
            const lastSeen = user.lastSeen?.toDate();
            return lastSeen && (now - lastSeen) < 5 * 60 * 1000; // 5 minutes
          }).length
        }
      }));
    }, (error) => {
      console.error('Error monitoring users:', error);
      setError(error);
    });
  }, []);

  // Monitor assessment reports
  const monitorAssessmentReports = useCallback(() => {
    const reportsQuery = query(collection(db, 'assessmentReports'));
    
    return onSnapshot(reportsQuery, (snapshot) => {
      const reports = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentReports = reports.filter(report => {
        const reportDate = report.createdAt?.toDate();
        return reportDate && reportDate >= last24Hours;
      });

      setMonitoringData(prev => ({
        ...prev,
        performance: {
          ...prev.performance,
          requests: recentReports.length,
          successRate: recentReports.length > 0 ? 
            (recentReports.filter(r => !r.error).length / recentReports.length) * 100 : 100
        }
      }));
    }, (error) => {
      console.error('Error monitoring assessment reports:', error);
      setError(error);
    });
  }, []);

  // Monitor system metrics (simulated for now)
  const monitorSystemMetrics = useCallback(() => {
    const interval = setInterval(() => {
      setMonitoringData(prev => ({
        ...prev,
        system: {
          cpu: Math.max(0, Math.min(100, prev.system.cpu + (Math.random() - 0.5) * 10)),
          memory: Math.max(0, Math.min(100, prev.system.memory + (Math.random() - 0.5) * 8)),
          disk: Math.max(0, Math.min(100, prev.system.disk + (Math.random() - 0.5) * 5)),
          network: Math.max(0, Math.min(100, prev.system.network + (Math.random() - 0.5) * 15))
        },
        performance: {
          ...prev.performance,
          responseTime: Math.max(50, prev.performance.responseTime + (Math.random() - 0.5) * 50),
          errors: prev.performance.errors + (Math.random() > 0.9 ? 1 : 0)
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Generate system alerts
  const generateAlerts = useCallback(() => {
    const interval = setInterval(() => {
      setMonitoringData(prev => {
        const newAlerts = [];
        
        // CPU alert
        if (prev.system.cpu > 85) {
          newAlerts.push({
            id: `cpu-${Date.now()}`,
            type: 'error',
            title: 'High CPU Usage',
            message: `CPU usage is at ${prev.system.cpu.toFixed(1)}%`,
            severity: 'high',
            timestamp: new Date(),
            source: 'System Monitor'
          });
        }
        
        // Memory alert
        if (prev.system.memory > 80) {
          newAlerts.push({
            id: `memory-${Date.now()}`,
            type: 'warning',
            title: 'High Memory Usage',
            message: `Memory usage is at ${prev.system.memory.toFixed(1)}%`,
            severity: 'medium',
            timestamp: new Date(),
            source: 'System Monitor'
          });
        }
        
        // Response time alert
        if (prev.performance.responseTime > 1000) {
          newAlerts.push({
            id: `response-${Date.now()}`,
            type: 'warning',
            title: 'Slow Response Time',
            message: `Response time is ${prev.performance.responseTime.toFixed(0)}ms`,
            severity: 'medium',
            timestamp: new Date(),
            source: 'Performance Monitor'
          });
        }
        
        // Error rate alert
        if (prev.performance.errors > 10) {
          newAlerts.push({
            id: `errors-${Date.now()}`,
            type: 'error',
            title: 'High Error Rate',
            message: `${prev.performance.errors} errors detected`,
            severity: 'high',
            timestamp: new Date(),
            source: 'Error Monitor'
          });
        }

        return {
          ...prev,
          alerts: [...newAlerts, ...prev.alerts].slice(0, 50) // Keep last 50 alerts
        };
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Initialize monitoring
  useEffect(() => {
    setLoading(true);
    
    const unsubscribeUsers = monitorUsers();
    const unsubscribeReports = monitorAssessmentReports();
    const clearSystemMetrics = monitorSystemMetrics();
    const clearAlerts = generateAlerts();

    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeReports();
      clearSystemMetrics();
      clearAlerts();
    };
  }, [monitorUsers, monitorAssessmentReports, monitorSystemMetrics, generateAlerts]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      setMonitoringData(prev => ({ ...prev }));
    };

    window.addEventListener('monitoring-refresh', handleRefresh);
    return () => window.removeEventListener('monitoring-refresh', handleRefresh);
  }, []);

  return {
    monitoringData,
    loading,
    error,
    refresh: () => {
      setMonitoringData(prev => ({ ...prev }));
    }
  };
};

export default useMonitoring;
