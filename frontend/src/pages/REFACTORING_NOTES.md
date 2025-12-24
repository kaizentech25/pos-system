# BI Analytics Refactoring: Modular Architecture

## Overview
The Business Intelligence feature has been refactored from a single monolithic dashboard into **TWO COMPLETELY SEPARATE ANALYTICS MODULES** with zero shared conditional logic.

---

## Module 1: Market Analytics Dashboard
**File:** `src/pages/MarketAnalyticsDashboard.jsx`

### Audience
- Platform owner
- Super admin
- Executives

### Purpose
- Ecosystem health monitoring
- Market trends analysis
- Company comparison and ranking

### Data Policy: AGGREGATED ONLY ✓
- ✅ All company data combined
- ✅ Time-based revenue trends
- ✅ Company comparison table (anonymous rankings)
- ✅ Market share distribution
- ❌ NO transaction history
- ❌ NO receipts
- ❌ NO hourly activity per store
- ❌ NO product-level detail tables
- ❌ NO company-specific drill-down

### Sections
1. **Platform Overview** - Aggregated KPIs
   - Total platform revenue
   - Total transactions count
   - Average transaction value
   - Active companies count

2. **Revenue Trends** - Time-based aggregated analysis
   - Highest/lowest revenue days
   - Average daily revenue
   - Revenue volatility

3. **Company Comparison** - Anonymized rankings
   - Ranking table with percentile/percentages
   - Revenue contribution
   - Transaction counts
   - Market share percentage

4. **Market Share** - Distribution visualization
   - Top 5 companies by revenue
   - Market share pie chart
   - Revenue distribution bar chart

5. **Platform Insights** - System-wide alerts
   - Aggregated insights only
   - No company-specific recommendations

### Access Control
- Platform owner / Super admin only
- Accessed via `/analytics/market`

---

## Module 2: Company Analytics Dashboard
**File:** `src/pages/CompanyAnalyticsDashboard.jsx`

### Audience
- Business owner
- Store manager
- Accountant

### Purpose
- Operate and optimize ONE business
- Audit and reconcile transactions
- Staff and inventory management

### Data Policy: COMPANY-SCOPED ONLY ✓
- ✅ Filtered to logged-in user's company
- ✅ Deep operational details
- ✅ Full transaction history
- ✅ Receipt viewing/printing
- ✅ Hourly activity heatmap (their store)
- ✅ Detailed product performance tables
- ✅ Staff member tracking
- ❌ NO competitor data
- ❌ NO market comparisons
- ❌ NO anonymous benchmarking

### Sections
1. **Overview** - Company KPIs
   - Total revenue (their company)
   - Transaction count
   - Average order value
   - Staff members

2. **Sales & Activity** - Daily and hourly trends
   - Revenue trend line chart
   - Daily transaction volume area chart
   - Peak hour identification
   - Peak hour revenue
   - Hourly transaction distribution bar chart
   - Hourly revenue bar chart
   - **Hourly activity heatmap** (store-specific)

3. **Product Performance** - Detailed analysis
   - Top product revenue metric
   - Average quantity per sale
   - Unique products sold count
   - Top 10 products by revenue (chart + data)
   - Top 10 products by units sold (chart + data)
   - **Complete product detail table** with:
     - Product name
     - Units sold
     - Revenue generated
     - Transaction count
     - Average price

4. **Transactions & Receipts** - Operational history
   - Total transactions in period
   - Total revenue generated
   - Average transaction value
   - Items sold count
   - **Full transaction table** with:
     - Date & time (sortable)
     - Transaction ID (sortable)
     - Products summary
     - Quantity
     - Total amount (sortable)
     - Payment method
     - **View Receipt action** (modal popup)
   - **Pagination** (20 items per page)
   - **Multi-field sorting** (date, ID, amount)

5. **Insights & Alerts** - Company-specific recommendations
   - Operational insights
   - Performance alerts
   - Anomaly detection

### Access Control
- Automatically filtered to user's company
- Accessed via `/analytics/company`
- Non-authenticated users or users without company assignment: Denied

---

## Architectural Improvements

### Before (Monolithic)
```
ManagerAnalyticsDashboard.jsx
├── selectedCompany state (filter)
├── Conditional: if (selectedCompany === 'all')
│   ├── Show aggregated views
│   └── Show comparisons
├── else
│   ├── Show company details
│   ├── Show transaction history
│   └── Show receipts
└── Mixed data contract
```

**Problems:**
- Single responsibilities violated
- Hard to maintain feature additions
- Confusing mental model (is it for market or company?)
- Test coverage complexity
- Performance issues with all data loaded

### After (Modular)
```
MarketAnalyticsDashboard.jsx
├── Aggregated data only
├── No user company context
├── No filters/conditionals
└── Clean, focused sections

CompanyAnalyticsDashboard.jsx
├── Single company context
├── Full operational data
├── No competitors visible
└── Clean, focused sections
```

**Benefits:**
- ✅ Single responsibility per dashboard
- ✅ Clear audience per module
- ✅ Easier to add features
- ✅ Better performance (load only needed data)
- ✅ Zero shared conditional logic
- ✅ Improved security (no competitor data leakage)
- ✅ Clearer data contracts

---

## Implementation Details

### Shared Components (Allowed)
These are safe to share as they're presentational/utility:
- `MetricCard` - KPI display
- `ChartCard` - Chart container
- `SimpleLineChart` - Rendering only
- `SimpleBarChart` - Rendering only
- `SimplePieChart` - Rendering only
- `HourlyHeatmapChart` - Rendering only
- `InsightCard` - Insight display
- `ReceiptModal` - Receipt display (CompanyAnalyticsDashboard only)
- `LoadingSkeleton` - Loading state
- Utility functions: `formatPeso()`, `formatTime12h()`

### Data Processing
- **MarketAnalyticsDashboard:** Uses all transactions, aggregates by time/company
- **CompanyAnalyticsDashboard:** Filters transactions by `user.company_name` only

### Time Range Filter
Both dashboards support:
- Last 24 hours
- Last 7 days
- Last 30 days
- All time

**Note:** Time range is isolated per dashboard (not shared state)

---

## Migration Path

### Update Routing
```javascript
// Add to your router configuration:
{
  path: '/analytics/market',
  element: <MarketAnalyticsDashboard />,
  requiredRole: 'admin' // or 'super_admin'
},
{
  path: '/analytics/company',
  element: <CompanyAnalyticsDashboard />,
  requiredRole: ['manager', 'inventory_manager', 'cashier']
}
```

### Update Navigation
Remove references to `ManagerAnalyticsDashboard` and point to:
- Platform admins → `/analytics/market`
- Business users → `/analytics/company`

---

## Security Considerations

### Market Analytics
- **Access:** Admin/Super Admin only (verify via middleware)
- **Data:** Aggregated, company identities visible but no transaction detail
- **Risk:** Low - shows market trends only

### Company Analytics
- **Access:** Filtered by logged-in user's company
- **Data:** Cannot view competitors' data
- **Risk:** Low - user can only see their own company

---

## Future Enhancements

### Market Analytics
- Export aggregated reports
- Market trend predictions
- Company health scoring
- KPI benchmarking
- Platform growth metrics

### Company Analytics
- Staff performance tracking
- Inventory management
- Customer analytics
- Discount/promo analysis
- Predictive demand forecasting
- Tax/compliance reports

---

## Files Changed

| File | Status | Notes |
|------|--------|-------|
| `src/pages/MarketAnalyticsDashboard.jsx` | ✨ NEW | Market/platform analytics |
| `src/pages/CompanyAnalyticsDashboard.jsx` | ✨ NEW | Company/operational analytics |
| `src/pages/ManagerAnalyticsDashboard.jsx` | ⚠️ LEGACY | Can be deprecated |

---

## Testing Checklist

- [ ] Market Analytics loads without company filter
- [ ] Company Analytics auto-loads user's company data
- [ ] Time range filters work independently
- [ ] Transaction sorting (date, ID, amount)
- [ ] Pagination functions correctly
- [ ] Receipt modal opens and displays data
- [ ] Hourly heatmap renders only in Company Analytics
- [ ] Product tables show in Company Analytics only
- [ ] Market share pie chart in Market Analytics only
- [ ] Company cannot see competitor data
- [ ] Admin can see all company data in Market Analytics
