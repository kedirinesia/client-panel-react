# Monitoring Components

Folder ini berisi komponen-komponen untuk monitoring sistem real-time pada admin panel Vossa4Tefa.

## 📁 Struktur File

```
Monitoring/
├── index.js                 # Export semua komponen
├── MonitoringDashboard.jsx  # Dashboard utama monitoring
├── RealTimeStats.jsx        # Statistik real-time
├── DataFlowMonitor.jsx      # Monitor alur data
├── SystemAlerts.jsx         # Sistem alert dan notifikasi
├── PerformanceCharts.jsx   # Chart performa sistem
└── README.md               # Dokumentasi ini
```

## 🚀 Komponen Utama

### 1. **MonitoringDashboard.jsx**
Dashboard utama yang mengintegrasikan semua komponen monitoring.
- Tab navigation (Overview, Performance, Data Flow, Alerts)
- Auto-refresh functionality
- Export data
- Fullscreen mode
- Settings panel

### 2. **RealTimeStats.jsx**
Menampilkan statistik sistem real-time:
- CPU, Memory, Disk, Network usage
- Response time dan error rate
- Database connections
- System health indicators

### 3. **DataFlowMonitor.jsx**
Monitor alur data sistem:
- Data flow visualization
- Queue status
- Success rate tracking
- Recent data flow events

### 4. **SystemAlerts.jsx**
Sistem alert dan notifikasi:
- Real-time alerts
- Alert filtering dan search
- Severity levels
- Alert management

### 5. **PerformanceCharts.jsx**
Chart performa sistem:
- Interactive charts (Line, Area, Bar, Pie)
- Time range selection
- Multiple metrics
- Real-time updates

## 🔧 Penggunaan

```jsx
import { MonitoringDashboard } from './components/Monitoring';

// Atau import individual components
import { 
  RealTimeStats, 
  DataFlowMonitor, 
  SystemAlerts, 
  PerformanceCharts 
} from './components/Monitoring';
```

## 📊 Fitur Monitoring

- ✅ **Real-time Updates** - Data update otomatis setiap 2-5 detik
- ✅ **Firebase Integration** - Terintegrasi dengan database Firebase
- ✅ **Responsive Design** - Support desktop, tablet, mobile
- ✅ **Interactive Charts** - Chart interaktif dengan Recharts
- ✅ **Alert System** - Sistem alert komprehensif
- ✅ **Export Data** - Export data monitoring
- ✅ **Fullscreen Mode** - Mode layar penuh
- ✅ **Auto-refresh** - Refresh otomatis yang dapat dikonfigurasi

## 🎯 Integrasi

Komponen monitoring sudah terintegrasi dengan:
- **Firebase Firestore** - Real-time data sync
- **Firebase Auth** - User authentication
- **Tailwind CSS** - Styling framework
- **Framer Motion** - Animations
- **Recharts** - Chart library
- **Lucide React** - Icons

## 📱 Navigation

Monitoring dashboard dapat diakses melalui sidebar navigation dengan menu "Monitoring" yang memiliki icon monitor.
