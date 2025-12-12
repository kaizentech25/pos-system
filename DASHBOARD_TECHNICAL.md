# Dashboard Implementation Details

## 📋 File Structure

```
frontend/src/
├── pages/
│   └── SystemMonitoringPage.jsx          # Main dashboard (rebuilt)
├── components/
│   ├── DashboardComponents.jsx           # Reusable UI components
│   ├── Charts.jsx                        # Recharts wrappers
│   ├── Navbar.jsx                        # Navigation
│   └── ...other components
├── lib/
│   ├── analyticsUtils.js                 # Calculation functions (NEW)
│   ├── axios.js                          # API config
│   └── utils.js
├── context/
│   └── ...context providers
└── App.jsx
```

---

## 🔧 Core Utilities

### analyticsUtils.js

#### `calculateRevenueTrend(transactions, days = 7)`
```javascript
// Returns 7-day revenue progression
// Input: array of transactions
// Output: [{ date: "Dec 05", revenue: 15000, transactions: 42 }, ...]
```

#### `calculateHourlyDistribution(transactions)`
```javascript
// Returns hourly breakdown (0-23 hours)
// Input: array of transactions
// Output: [{ hour: 0, count: 5, revenue: 2500 }, ...]
```

#### `calculateProductAnalytics(transactions)`
```javascript
// Calculates product-level metrics
// Input: array of transactions with items
// Output: [{ 
//   name: "Coke 1L",
//   quantity: 150,
//   revenue: 6750,
//   transactions: 45,
//   sku: "7E-B001"
// }, ...]
```

#### `calculateCompanyComparison(transactions, companies)`
```javascript
// Company-level KPIs
// Output: {
//   "7 Eleven Jimenez": {
//     name: "7 Eleven Jimenez",
//     revenue: 125000,
//     transactions: 350,
//     avgTransaction: 357.14
//   },
//   ...
// }
```

#### `generateInsights(transactions, companies, products, timeRange)`
```javascript
// Auto-generated business insights
// Output: [
//   "💼 7 Eleven Jimenez leads with ₱125,000 in 7d",
//   "⭐ Best seller: Coke 1L with 150 units sold",
//   "⏰ Peak hour: 5:00 with 42 transactions",
//   "💰 Average transaction: ₱357.14"
// ]
```

#### `calculateGrowth(current, previous)`
```javascript
// Growth percentage calculation
// Returns: -15.5 (for -15.5% decline) or 25.3 (for +25.3% growth)
```

---

## 🎨 Dashboard Components

### DashboardComponents.jsx

#### `<MetricCard />`
Props:
- `label`: string - metric name
- `value`: string/number - metric value
- `change`: number - percentage change (optional)
- `icon`: ReactIcon - lucide icon
- `color`: string - "blue"|"green"|"purple"|"orange"|"red"

Example:
```jsx
<MetricCard
  label="Total Revenue"
  value="₱125,000"
  change={15.5}
  icon={TrendingUp}
  color="green"
/>
```

#### `<ChartCard />`
Props:
- `title`: string - card title
- `icon`: ReactIcon - lucide icon
- `children`: ReactNode - chart component

Example:
```jsx
<ChartCard title="Revenue Trend" icon={TrendingUp}>
  <SimpleLineChart data={revenueTrend} dataKey="revenue" />
</ChartCard>
```

#### `<InsightCard />`
Props:
- `insights`: string[] - array of insight strings

Example:
```jsx
<InsightCard insights={[
  "💼 Company X leads with ₱Y",
  "⭐ Best seller: Product A"
]} />
```

#### `<SimpleChart />`
Props:
- `data`: array - chart data
- `type`: "bar"|"horizontal" - chart type

Data format:
```javascript
[
  { label: "Product A", displayValue: "₱1,500", value: 1500 },
  { label: "Product B", displayValue: "₱1,200", value: 1200 }
]
```

#### `<LoadingSkeleton />`
Shows animated loading placeholder while data loads.

---

## 📊 Chart Components

### Charts.jsx (Recharts Wrappers)

#### `<SimpleLineChart />`
```jsx
<SimpleLineChart
  data={revenueTrend}
  dataKey="revenue"
  color="#3b82f6"
/>
```

#### `<SimpleAreaChart />`
```jsx
<SimpleAreaChart
  data={revenueTrend}
  dataKey="transactions"
  color="#8b5cf6"
/>
```

#### `<SimpleBarChart />`
```jsx
<SimpleBarChart
  data={hourlyDist}
  dataKey="value"
  color="#f59e0b"
/>
```

#### `<SimplePieChart />`
```jsx
<SimplePieChart
  data={[
    { name: "Company A", value: 35 },
    { name: "Company B", value: 65 }
  ]}
/>
```

#### `<HourlyHeatmapChart />`
Custom heatmap with 24 grid cells (one per hour).
```jsx
<HourlyHeatmapChart data={hourlyDist} />
```

---

## 🎯 Main Dashboard (SystemMonitoringPage.jsx)

### State Structure
```javascript
const [stats, setStats] = useState({
  users: [],           // User objects
  products: [],        // Product objects
  transactions: [],    // Transaction objects
  companies: []        // Company names array
});

const [activeSection, setActiveSection] = useState('overview');
const [selectedCompany, setSelectedCompany] = useState('all');
const [timeRange, setTimeRange] = useState('7d');
const [loading, setLoading] = useState(true);
```

### Memoized Calculations
All analytics are memoized with `useMemo` to prevent unnecessary recalculations:

```javascript
const revenueTrend = useMemo(() => 
  calculateRevenueTrend(filteredTransactions, 7),
  [filteredTransactions]
);

const hourlyDist = useMemo(() => 
  calculateHourlyDistribution(filteredTransactions),
  [filteredTransactions]
);

// ... other memoized values
```

### Data Flow
1. **Fetch**: `fetchMonitoringData()` gets data from API
2. **Filter**: `filteredTransactions` based on company & time range
3. **Calculate**: Analytics computed via memoized functions
4. **Render**: Charts and metrics display calculated data
5. **Update**: Filters trigger recalculation via dependency arrays

---

## 🔄 API Integration

### Endpoints Used
- `GET /api/auth/users` - List of users
- `GET /api/transactions` - All transactions with items
- `GET /api/products` - Product catalog

### Data Structure (Example)

**Transaction**:
```javascript
{
  _id: "...",
  company_name: "7 Eleven Jimenez",
  totalAmount: 1500,
  createdAt: "2025-12-11T15:30:00Z",
  items: [
    {
      productName: "Coke 1L",
      quantity: 2,
      price: 65,
      sku: "7E-B001"
    }
  ]
}
```

**User**:
```javascript
{
  _id: "...",
  user_id: "mgr001",
  name: "John Manager",
  role: "manager", // or "cashier", "inventory_manager"
  company_name: "7 Eleven Jimenez"
}
```

**Product**:
```javascript
{
  _id: "...",
  name: "Coke 1L",
  sku: "7E-B001",
  price: 65,
  category: "Beverages",
  company_name: "7 Eleven Jimenez"
}
```

---

## 🚀 Performance Optimizations

1. **Memoization**: All derived data cached with `useMemo`
2. **Lazy Filtering**: Transactions filtered before calculations
3. **Chunked Rendering**: Charts render in separate grid items
4. **Conditional Display**: Only selected section renders (reduces DOM)
5. **Image/Icon Optimization**: Lucide icons are lightweight SVGs
6. **API Batching**: All API calls parallelized with `Promise.all`

---

## 🎨 Styling Approach

Using **Tailwind CSS** exclusively:
- No CSS files needed
- Utility-first approach
- Dark mode via `dark:` prefix
- Responsive via breakpoints: `sm`, `md`, `lg`
- Consistent spacing (4px base unit)

Example:
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  // 1 column on mobile, 2 on tablet, 4 on desktop
  // 6 spacing units (24px) gap, 8 units bottom margin
</div>
```

---

## 🔧 Extending the Dashboard

### Adding a New Chart
```javascript
// 1. Add calculation function in analyticsUtils.js
export const calculateNewMetric = (transactions) => {
  // ... calculation logic
  return data;
};

// 2. Use in component
const newData = useMemo(() => 
  calculateNewMetric(filteredTransactions),
  [filteredTransactions]
);

// 3. Render with chart component
<ChartCard title="New Metric" icon={SomeIcon}>
  <SimpleBarChart data={newData} />
</ChartCard>
```

### Adding a New Section
```javascript
// 1. Add to dashboardSections array
const dashboardSections = [
  // ... existing
  { key: 'newsection', label: '🆕 New Section' },
];

// 2. Add conditional render
{activeSection === 'newsection' && (
  <>
    {/* Section content */}
  </>
)}
```

---

## 🧪 Testing

### Testing Calculator Functions
```javascript
const mockTransactions = [
  { totalAmount: 1000, items: [...] },
  { totalAmount: 500, items: [...] }
];

const result = calculateRevenueTrend(mockTransactions, 7);
console.log(result); // Should have 7 days of data
```

### Testing Components
```javascript
// Render MetricCard
<MetricCard 
  label="Test" 
  value="1000" 
  change={10} 
  icon={TrendingUp}
/>
// Should show: "1000" with "+10%" change
```

---

## 📱 Mobile Considerations

- Charts: Auto-scale to container width (ResponsiveContainer)
- Cards: Stack vertically on mobile
- Tables: Horizontal scroll on mobile
- Filters: Stacked in column layout on mobile
- Touch-friendly: Larger tap targets (min 48px)

---

## 🔒 Security Notes

- All data filtering done on frontend (server can still enforce)
- No sensitive customer data in calculations
- Company filter respects user's company assignment (backend validation)
- API authentication via axios config

---

## 📚 Dependencies

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "axios": "^1.13.2",
  "lucide-react": "^0.556.0",
  "recharts": "^2.x" // Need to install
}
```

Install Recharts:
```bash
npm install recharts
```

---

## 🚢 Deployment Notes

1. No environment variables needed (uses existing API config)
2. Recharts bundle size: ~200KB (gzipped)
3. All components are lazy-loadable if needed
4. Works with existing authentication system

---

Last Updated: December 11, 2025
Maintained by: Development Team
