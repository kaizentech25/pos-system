# Dashboard Refactor - Quick Reference

## What Changed?

**Before**: One combined `SystemMonitoringPage.jsx` for both admin and manager users
**After**: Two separate, specialized dashboards

---

## Role-Based Dashboards

### 👨‍💻 ADMIN (Developer)
**Route**: `/system-monitoring`
**Focus**: Technical diagnostics & performance

**Shows**:
- System health score
- API latency & throughput
- Database metrics
- Service status
- Error logs & failures
- Request spikes
- Transaction failures
- Recent activity

**Does NOT show**:
- Revenue, sales data
- Product performance
- Company comparison
- Business insights
- Market analysis

---

### 👔 MANAGER (Business Owner)
**Route**: `/analytics`
**Focus**: Business intelligence & analytics

**Shows**:
- Revenue & growth
- Transaction trends
- Product performance
- Company comparison
- Hourly patterns
- Market share
- Business insights
- Customer metrics

**Does NOT show**:
- System health
- API diagnostics
- Database internals
- Error logs
- Server metrics

---

## Files Created

```
✨ NEW FILES:
├── frontend/src/pages/AdminSystemMonitoring.jsx
├── frontend/src/pages/ManagerAnalyticsDashboard.jsx
└── frontend/src/lib/adminUtils.js

📝 UPDATED FILES:
├── frontend/src/App.jsx (routing)
└── frontend/src/components/Navbar.jsx (role-based links)

📦 ARCHIVED:
└── frontend/src/pages/SystemMonitoringPage.jsx (original combined page)
```

---

## User Login Flow

```
LOGIN
  ↓
ROLE CHECK
  ├─ admin → /system-monitoring (AdminSystemMonitoring)
  ├─ manager → /analytics (ManagerAnalyticsDashboard)
  ├─ inventory_manager → /products
  └─ cashier → /pos
```

---

## Key Differences

| Aspect | Admin | Manager |
|--------|-------|---------|
| **URL** | `/system-monitoring` | `/analytics` |
| **Focus** | Technical | Business |
| **Charts** | Heatmap, status bars | Line, area, bar, pie |
| **Metrics** | API, DB, errors | Revenue, products, growth |
| **Refresh** | 30s auto-refresh toggle | Manual refresh button |
| **Sections** | Status-based | 6 dashboard tabs |
| **Data** | 2 API calls | 3 API calls |
| **Utilities** | `adminUtils.js` | `analyticsUtils.js` |

---

## Routing Rules

```javascript
// Protected Routes (in App.jsx)
/system-monitoring    → AdminSystemMonitoring (admin only)
/analytics            → ManagerAnalyticsDashboard (manager only)
/users                → UsersPage (admin only)
/products             → ProductsPage (admin, manager, inventory_manager)
/pos                  → POSTerminalPage (admin, cashier)
/dashboard            → DashboardPage (admin, manager)
/reports              → ReportsPage (admin, manager)
```

---

## Navigation

### Admin Navbar
```
TechWisePH POS | System | Users | Features ▼ | Theme | Logout
```

### Manager Navbar
```
TechWisePH POS | Analytics | Features ▼ | Theme | Logout
```

---

## Features

### AdminSystemMonitoring
✅ Overall health percentage
✅ API performance (latency, throughput, requests)
✅ Database status (connections, response time, cache)
✅ Service status (6 services)
✅ Error analysis (by type & severity)
✅ Transaction failures (by reason)
✅ Request spikes (hourly heatmap)
✅ Recent activity (last transactions, active users)
✅ Auto-refresh toggle (30s cycle)
✅ Manual refresh button

### ManagerAnalyticsDashboard
✅ 6 dashboard sections (dropdown selector)
✅ Time range filters (24h, 7d, 30d, all time)
✅ Company filter (all or individual)
✅ Revenue analytics (trends, highs/lows, variance)
✅ Product performance (top items, rankings, table)
✅ Company comparison (revenue, transactions, market share)
✅ Hourly activity (peak hours, distribution, heatmap)
✅ Business insights (auto-generated)
✅ User role distribution
✅ Top companies ranking
✅ Recent transactions list
✅ 5+ chart types

---

## Utilities Breakdown

### adminUtils.js (NEW)
```javascript
calculateSystemHealth()      // Overall % + metrics
calculateAPIMetrics()        // Requests, latency, throughput
calculateTransactionFailures() // Failure breakdown
calculateErrorLogs()         // Errors by type/severity
calculateDatabaseMetrics()   // DB performance stats
calculateRequestSpikes()     // Hourly spike detection
calculateRecentActivity()    // Last activities
getServiceStatus()          // All service statuses
getHealthColor()            // Color coding for health
getHealthBg()               // Background color helper
```

### analyticsUtils.js (EXISTING)
```javascript
calculateRevenueTrend()      // Daily revenue progression
calculateHourlyDistribution() // Transaction distribution
calculateProductAnalytics()  // Product metrics
calculateCompanyComparison() // Company benchmarking
generateInsights()          // Auto-generated insights
calculateGrowth()           // Period-over-period %
formatMetric()              // Format currency/numbers
```

---

## Shared Components

Both dashboards use the same components for consistency:

### DashboardComponents.jsx
- `<MetricCard>` - KPI display with trend
- `<ChartCard>` - Chart wrapper with title
- `<InsightCard>` - Insights display
- `<SimpleChart>` - Generic bar chart wrapper
- `<LoadingSkeleton>` - Loading placeholder

### Charts.jsx
- `<SimpleLineChart>` - Line chart for trends
- `<SimpleAreaChart>` - Area chart for volume
- `<SimpleBarChart>` - Bar chart for comparisons
- `<SimplePieChart>` - Pie chart for shares
- `<HourlyHeatmapChart>` - Heatmap for hourly data

---

## Data Flow

### Admin Page
```
useEffect → axios.get('/auth/users', '/transactions')
         → calculateSystemHealth()
         → calculateAPIMetrics()
         → calculateErrorLogs()
         → [... other admin calcs ...]
         → render technical dashboard
         → auto-refresh every 30s (toggle)
```

### Manager Page
```
useEffect → axios.get('/auth/users', '/transactions', '/products')
         → filter by company & time range
         → useMemo(calculateRevenueTrend)
         → useMemo(calculateProductAnalytics)
         → useMemo(calculateCompanyComparison)
         → [... other analytics calcs ...]
         → render business dashboard
         → manual refresh only
```

---

## Access Control

### ProtectedRoute Component
```javascript
allowedRoles={["admin"]}    // Only admin can access
allowedRoles={["manager"]}  // Only manager can access
allowedRoles={["admin", "manager"]} // Both can access
```

### Navbar Visibility
```javascript
{canMonitoring && <Link to="/system-monitoring">} // admin only
{canAnalytics && <Link to="/analytics">}          // manager only
{canUsers && <Link to="/users">}                   // admin only
```

---

## Testing Checklist

- [ ] Admin login redirects to `/system-monitoring`
- [ ] Manager login redirects to `/analytics`
- [ ] Admin cannot view `/analytics` (403)
- [ ] Manager cannot view `/system-monitoring` (403)
- [ ] Admin dashboard shows system health metrics
- [ ] Manager dashboard shows revenue/product metrics
- [ ] Charts render correctly on both
- [ ] Filters work on manager dashboard
- [ ] Dark mode works on both
- [ ] Mobile responsive on both
- [ ] No console errors

---

## How to Extend

### Add Admin Metric
1. Create function in `adminUtils.js`
2. Call with `useMemo` in `AdminSystemMonitoring.jsx`
3. Render in appropriate card/section

### Add Manager Metric
1. Create function in `analyticsUtils.js`
2. Call with `useMemo` in `ManagerAnalyticsDashboard.jsx`
3. Add to appropriate dashboard section

### Add Chart Type
1. Create component in `Charts.jsx`
2. Import in respective dashboard
3. Pass data and render

---

## Summary

✅ Clean separation: Admin page ≠ Manager page
✅ Role-based routing: Users auto-directed to their dashboard
✅ No duplication: Shared components & utilities
✅ Professional: Responsive, dark mode, formatted data
✅ Maintainable: Clear file structure, modular code
✅ Extensible: Easy to add new metrics or charts

**Result**: Two specialized, lightweight dashboards instead of one bloated page trying to do everything.

