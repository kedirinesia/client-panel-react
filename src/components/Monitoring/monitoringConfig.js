// Monitoring Configuration
export const MONITORING_CONFIG = {
  // Refresh intervals in milliseconds
  refreshIntervals: {
    fast: 2000,    // 2 seconds
    normal: 5000,  // 5 seconds
    slow: 10000,   // 10 seconds
    verySlow: 30000 // 30 seconds
  },

  // System thresholds
  thresholds: {
    cpu: {
      warning: 70,
      critical: 85
    },
    memory: {
      warning: 75,
      critical: 85
    },
    disk: {
      warning: 80,
      critical: 90
    },
    network: {
      warning: 80,
      critical: 95
    },
    responseTime: {
      warning: 500,
      critical: 1000
    },
    errorRate: {
      warning: 2,
      critical: 5
    }
  },

  // Alert settings
  alerts: {
    maxAlerts: 50,
    autoDismiss: false,
    soundEnabled: false,
    emailNotifications: false
  },

  // Chart settings
  charts: {
    maxDataPoints: 25,
    animationDuration: 300,
    colors: {
      primary: '#3B82F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#8B5CF6'
    }
  },

  // Export settings
  export: {
    formats: ['json', 'csv', 'pdf'],
    defaultFormat: 'json',
    includeCharts: true,
    includeAlerts: true
  }
};

// Default monitoring settings
export const DEFAULT_MONITORING_SETTINGS = {
  autoRefresh: true,
  refreshInterval: MONITORING_CONFIG.refreshIntervals.normal,
  notificationsEnabled: true,
  fullscreenMode: false,
  selectedTab: 'overview',
  chartTimeRange: '1h',
  alertFilter: 'all',
  searchTerm: ''
};

// System health status
export const SYSTEM_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
  ERROR: 'error'
};

// Alert types
export const ALERT_TYPES = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

// Alert severity levels
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Chart types
export const CHART_TYPES = {
  LINE: 'line',
  AREA: 'area',
  BAR: 'bar',
  PIE: 'pie'
};

// Time ranges
export const TIME_RANGES = {
  '1h': '1 Hour',
  '6h': '6 Hours',
  '24h': '24 Hours',
  '7d': '7 Days'
};
