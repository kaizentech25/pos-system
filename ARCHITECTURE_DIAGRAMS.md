# Dashboard Refactor - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER LOGIN                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ROLE CHECK
                    /      |      \
                   /       |       \
                  /        |        \
                 /         |         \
              ADMIN     MANAGER    CASHIER/INVENTORY
               │           │            │
               ▼           ▼            ▼
       /system-monitoring /analytics   /pos
               │           │            │
               ▼           ▼            ▼
    ┌──────────────┐  ┌────────────────┐   ┌─────────────┐
    │   ADMIN      │  │    MANAGER     │   │    POS      │
    │  SYSTEM      │  │  ANALYTICS     │   │  TERMINAL   │
    │ MONITORING   │  │  DASHBOARD     │   │             │
    └──────────────┘  └────────────────┘   └─────────────┘
         │                    │
         ├─ Health Status     ├─ Revenue Trends
         ├─ API Metrics       ├─ Product Analytics
         ├─ DB Status         ├─ Company Compare
         ├─ Errors            ├─ Hourly Activity
         ├─ Failures          ├─ Business Insights
         ├─ Spikes            └─ Top Performers
         └─ Activity
```

---

## User Role Flow

```
                    ┌──────────────┐
                    │   LOGIN      │
                    │   PAGE       │
                    └──────┬───────┘
                           │
                    AUTHENTICATE
                           │
                ┌──────────┴──────────┐
                │   Check Role        │
                └──────────┬──────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ADMIN               MANAGER            CASHIER
        │                  │                  │
        │ Redirect         │ Redirect         │ Redirect
        │ to:              │ to:              │ to:
        ▼                  ▼                  ▼
  /system-monitoring  /analytics         /pos
        │                  │                  │
        ▼                  ▼                  ▼
   AdminSystem         Manager          POS
   Monitoring          Analytics        Terminal
        │                  │                  │
        ├─ Uses:          ├─ Uses:          └─ Uses:
        │  adminUtils.js  │  analyticsUtils   Charts
        │  (technical)    │  (business)       CartContext
        └─ Shows:        └─ Shows:
           - Health         - Revenue
           - API Stats      - Products
           - DB Status      - Companies
           - Errors         - Insights
           - Failures
           - Spikes
```

---

## Component Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    App.jsx                                  │
│               (Route Configuration)                         │
└─────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
    ┌──────────────┐  ┌────────────┐  ┌──────────────┐
    │ ADMIN PAGE   │  │ MANAGER    │  │ OTHER PAGES  │
    │ System       │  │ PAGE       │  │              │
    │ Monitoring   │  │ Analytics  │  │ POS, Users,  │
    └──────┬───────┘  └─────┬──────┘  │ Products     │
           │                │         │ etc.         │
           │                │         └──────────────┘
           │                │
           │                │
    ┌──────▼──────┐  ┌──────▼──────┐
    │ COMPONENTS  │  │ COMPONENTS  │
    │ (Shared)    │  │ (Shared)    │
    ├─ Navbar     │  ├─ Navbar     │
    ├─ MetricCard │  ├─ MetricCard │
    ├─ ChartCard  │  ├─ ChartCard  │
    ├─ Charts     │  ├─ Charts     │
    │ (line, bar, │  │ (line, area,│
    │ pie, etc.)  │  │ bar, pie)   │
    └──────┬──────┘  └──────┬──────┘
           │                │
           ▼                ▼
    ┌──────────────┐  ┌────────────┐
    │ UTILITIES    │  │ UTILITIES  │
    ├─adminUtils  │  ├─analytics  │
    │ (technical) │  │ Utils      │
    │             │  │ (business) │
    └─────────────┘  └────────────┘
```

---

## Data Flow

### ADMIN DASHBOARD

```
                    AdminSystemMonitoring.jsx
                            │
                    ┌───────┴───────┐
                    │               │
                    ▼               ▼
            axios.get             axios.get
            /auth/users          /transactions
                    │               │
                    └───────┬───────┘
                            │
                    useEffect (run once)
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        calculateSystemHealth   calculateAPIMetrics
                │                       │
                │   useMemo(            │   useMemo(
                │   calculations        │   calculations
                │   )                   │   )
                │                       │
                └───────────┬───────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
        calculateError  calculateFailures  calculateSpikes
        Logs            (+ 4 more calcs)
            │               │               │
            └───────────────┼───────────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
                ▼                       ▼
        Auto-refresh       Manual refresh
        every 30s          button
                │                       │
                └───────────┬───────────┘
                            │
                    Render Dashboard
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
        Health Card    Service Table    Error List
        (+ more        (6 services)    (+ failures,
         sections)                      spikes)
```

### MANAGER DASHBOARD

```
                 ManagerAnalyticsDashboard.jsx
                            │
                ┌───────────┬┴──────────┐
                │           │          │
                ▼           ▼          ▼
        axios.get      axios.get   axios.get
        /auth/users   /trans...    /products
                │           │          │
                └───────────┼──────────┘
                            │
                    useEffect (run once)
                            │
        ┌───────────────────┴──────────────────┐
        │                                      │
        ▼ (Filters Applied: company + time)   │
                │                             │
    useMemo(    │       useMemo(        useMemo(
    Filter      │       Calculate       Calculate
    trans)      │       Revenue)        Products)
        │       │           │               │
        └───┬───┴─────┬─────┴───────┬──────┘
            │         │             │
            ▼         ▼             ▼
    calculated  calculated     calculated
    transactions  revenue      products
            │         │             │
            └────┬────┴────┬────────┘
                 │         │
            useMemo(    useMemo(
            calculate  calculate
            Hourly)    Companies)
                 │         │
                 └────┬────┘
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
    Time Range Filter      Company Filter
        │                           │
        ├─ Last 24h              ├─ All
        ├─ Last 7d              ├─ Individual
        ├─ Last 30d
        └─ All Time
        │                           │
        └────────────┬──────────────┘
                     │
        Select Active Section
        │
        ├─ Overview
        ├─ Revenue
        ├─ Products
        ├─ Companies
        ├─ Hourly
        └─ Insights
                     │
            Render Section
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    KPI Cards   Charts       Tables
    (metric)    (5 types)    (detailed)
```

---

## File Dependency Graph

```
Frontend/
├── pages/
│   ├── AdminSystemMonitoring.jsx
│   │   └─ imports:
│   │       ├─ lib/adminUtils.js ✨NEW
│   │       ├─ components/Navbar.jsx
│   │       └─ lib/axios.js
│   │
│   ├── ManagerAnalyticsDashboard.jsx ✨NEW
│   │   └─ imports:
│   │       ├─ lib/analyticsUtils.js (existing)
│   │       ├─ components/DashboardComponents.jsx
│   │       ├─ components/Charts.jsx
│   │       ├─ components/Navbar.jsx
│   │       └─ lib/axios.js
│   │
│   └── [Other pages...]
│
├── components/
│   ├── DashboardComponents.jsx
│   │   ├─ MetricCard
│   │   ├─ ChartCard
│   │   ├─ InsightCard
│   │   ├─ SimpleChart
│   │   └─ LoadingSkeleton
│   │
│   ├── Charts.jsx
│   │   ├─ SimpleLineChart (custom tooltip)
│   │   ├─ SimpleAreaChart (custom tooltip)
│   │   ├─ SimpleBarChart (custom tooltip)
│   │   ├─ SimplePieChart (custom tooltip)
│   │   └─ HourlyHeatmapChart
│   │
│   ├── Navbar.jsx (UPDATED)
│   │   ├─ Shows "System" link for admin
│   │   └─ Shows "Analytics" link for manager
│   │
│   └── [Other components...]
│
├── lib/
│   ├── adminUtils.js ✨NEW
│   │   ├─ calculateSystemHealth()
│   │   ├─ calculateAPIMetrics()
│   │   ├─ calculateErrorLogs()
│   │   ├─ calculateDatabaseMetrics()
│   │   ├─ calculateRequestSpikes()
│   │   ├─ getServiceStatus()
│   │   └─ [Other functions...]
│   │
│   ├── analyticsUtils.js (existing)
│   │   ├─ calculateRevenueTrend()
│   │   ├─ calculateProductAnalytics()
│   │   ├─ calculateCompanyComparison()
│   │   ├─ generateInsights()
│   │   └─ [Other functions...]
│   │
│   └── axios.js
│
├── context/
│   ├─ AuthContext.jsx
│   └─ CartContext.jsx
│
└── App.jsx (UPDATED)
    ├─ imports AdminSystemMonitoring
    ├─ imports ManagerAnalyticsDashboard
    └─ routes:
        ├─ /system-monitoring → AdminSystemMonitoring
        └─ /analytics → ManagerAnalyticsDashboard
```

---

## Access Control Flow

```
┌──────────────────────────┐
│  Protected Route Check   │
│  (ProtectedRoute.jsx)    │
└────────────┬─────────────┘
             │
        ┌────▼─────┐
        │ User     │
        │ logged   │
        │ in?      │
        └────┬─────┘
             │
        ┌────┴─────┬──────────────┐
        │ NO        │ YES          │
        ▼           ▼              │
   Redirect      Check         ┌──▼──┐
   to login      allowed       │Role?│
                 roles?        └──┬──┘
                  │               │
        ┌─────────┴─────────┐    │
        │ Role matches?     │    │
        └────┬────────┬─────┘    │
             │        │          │
             YES      NO         │
             │        │          │
             ▼        ▼          │
          Render   Redirect   ┌──┴───┐
          Page     to         │Admin │
                   /unauth    │      │
                              ├─ Can access:
                              │ /system-monitoring
                              │ /users
                              │ /pos
                              │ /products
                              │ /dashboard
                              │
                              │ Cannot access:
                              │ /analytics
                              │
                              ├─ Manager
                              │
                              ├─ Can access:
                              │ /analytics
                              │ /products
                              │ /dashboard
                              │ /reports
                              │
                              └─ Cannot access:
                                 /system-monitoring
                                 /users
```

---

## Metrics Categorization

```
┌─────────────────────────────────────────────────────────┐
│              ALL AVAILABLE METRICS                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  TECHNICAL METRICS        │  BUSINESS METRICS          │
│  (Admin Dashboard)        │  (Manager Dashboard)       │
│                           │                            │
│  ├─ System Health         │  ├─ Total Revenue         │
│  ├─ API Latency           │  ├─ Transaction Count     │
│  ├─ Error Rate            │  ├─ Average Order Value   │
│  ├─ Request Throughput    │  ├─ Revenue Growth %      │
│  ├─ DB Response Time      │  ├─ Product Rankings     │
│  ├─ Active Connections    │  ├─ Company Comparison    │
│  ├─ Cache Hit Rate        │  ├─ Hourly Patterns      │
│  ├─ Replication Lag       │  ├─ Market Share         │
│  ├─ Error by Type         │  ├─ Business Insights    │
│  ├─ Failure Reasons       │  ├─ Top Sellers          │
│  ├─ Request Spikes        │  ├─ Daily Trends         │
│  ├─ Service Uptime        │  ├─ Peak Hours           │
│  ├─ Last Activity         │  └─ Recent Transactions  │
│  └─ API Calls/Sec         │                            │
│                           │                            │
└─────────────────────────────────────────────────────────┘
```

---

## State Management

### Admin Dashboard State
```javascript
const [stats, setStats] = useState({
  users: [],
  transactions: []
})

const [systemHealth, setSystemHealth] = useState({
  status: 'checking',
  overallHealth: 0,
  uptime: 0,
  avgLatency: 0,
  errorRate: 0,
  activeConnections: 0,
  dbHealth: 'unknown',
  lastCheck: new Date()
})

const [autoRefresh, setAutoRefresh] = useState(true)
const [currentTime, setCurrentTime] = useState(new Date())
```

### Manager Dashboard State
```javascript
const [stats, setStats] = useState({
  users: [],
  products: [],
  transactions: [],
  companies: []
})

const [activeSection, setActiveSection] = useState('overview')
const [selectedCompany, setSelectedCompany] = useState('all')
const [timeRange, setTimeRange] = useState('7d')
const [currentTime, setCurrentTime] = useState(new Date())
```

---

## Summary

✅ **Separation**: Admin ≠ Manager (no feature overlap)
✅ **Routing**: Role-based automatic direction
✅ **Components**: Shared, reusable UI elements
✅ **Utilities**: Specialized calculation functions
✅ **Access**: Protected routes enforce role restrictions
✅ **UX**: Optimized design for each user type
✅ **Performance**: Lightweight separate bundles
✅ **Maintenance**: Easy to extend and debug

