# Inventory Module - Quick Reference

## 🎯 Key Features at a Glance

### Dashboard Stats (Top of Page)
```
┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│  Total Products │ Total Stock     │   Stock Value   │ Low Stock Items │
│      📦 150     │   🔢 12,345    │   💰 ₱250,000  │    ⚠️ 8        │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘
```

### Search & Filter Bar
```
┌────────────────────────────────────────────────────────────────┐
│ 🔍 Search by name, SKU, or barcode...    [Filter ▾]  [+ Add]  │
└────────────────────────────────────────────────────────────────┘
```

### Product Table Columns
```
Product | SKU/Barcode | Price | Stock | Stock Value | Margin % | Category | Actions
--------|-------------|-------|-------|-------------|----------|----------|----------
Widget  | WDG-001     | ₱100  |  50   |   ₱2,500   |   30%    | Snacks   | ↑↓✏️🗑️
[Badge] | 1234567890  | Cost:₱70           [Low/OK]
```

### Stock Status Badges
- 🟢 **In Stock** - Stock > threshold
- 🟡 **Low Stock** - Stock ≤ threshold  
- 🔴 **Out of Stock** - Stock = 0

## 📋 Common Actions

### Add New Product
**Button:** `+ Add Product` (top right)
**Fields:**
- Name*, SKU*, Barcode*, Category*
- Selling Price*, Cost Price*
- Stock Quantity*, Low Stock Alert

**Shows:** Live margin calculation as you type

### Stock In (Receive Inventory)
**Button:** ↑ (green) on product row
**Flow:**
1. Click Stock In button
2. Enter quantity received
3. Add note (optional): "Supplier delivery #1234"
4. Confirm → Stock increases

### Stock Out (Remove Inventory)
**Button:** ↓ (red) on product row
**Flow:**
1. Click Stock Out button
2. Enter quantity removed
3. Add note (optional): "Damaged goods"
4. Confirm → Stock decreases

### View Stock History
**In Stock Adjust Modal:**
1. Click "View History" button
2. See last 50 transactions
3. Each entry shows:
   - Type (IN/OUT badge)
   - Previous → New stock
   - Timestamp
   - Note

### Edit Product
**Button:** ✏️ (pencil icon)
**Updates:** Any product field
**Shows:** Same form as Add Product

### Delete Product
**Button:** 🗑️ (trash icon)
**Confirms:** "Are you sure?"
**Removes:** Product from inventory

## 🔢 Calculations

### Margin Percentage
```
Margin % = ((Selling Price - Cost) / Selling Price) × 100

Example:
Price = ₱100, Cost = ₱70
Margin = ((100 - 70) / 100) × 100 = 30%
```

### Stock Value
```
Stock Value = Cost × Quantity

Example:
Cost = ₱70, Stock = 50
Value = ₱70 × 50 = ₱3,500
```

### Total Stock Value (Dashboard)
```
Total = Σ (Product Cost × Product Stock)
```

## 🎨 UI Components Used

### DaisyUI Components
- `stats` - Dashboard stat cards
- `card` - Main content container
- `table` - Product listing
- `modal` - Add/Edit/Adjust forms
- `badge` - Stock status indicators
- `btn` - All buttons
- `input` - Text/number inputs
- `select` - Dropdown filters
- `textarea` - Notes field
- `alert` - Preview/info messages

### Lucide Icons
- `Package` - Main page icon
- `Search` - Search bar
- `Filter` - Category filter
- `Plus` - Add product
- `Edit` - Edit action
- `Trash2` - Delete action
- `TrendingUp` - Stock in
- `TrendingDown` - Stock out
- `ChevronUp/Down` - Sort indicators
- `Clock` - History viewer
- `X` - Close modals

## 🔄 Sorting

### Sortable Columns
- **Name** (A-Z / Z-A)
- **Price** (Low-High / High-Low)
- **Stock** (Low-High / High-Low)
- **Category** (A-Z / Z-A)

**How:** Click column header to toggle sort direction
**Indicator:** Chevron up ↑ or down ↓

## 🔍 Search Behavior

**Searches in:**
- Product name
- SKU code
- Barcode

**Type:** Case-insensitive, partial match
**Update:** Real-time as you type

## 📱 Responsive Design

### Desktop (>1024px)
- 4-column stats grid
- Full table with all columns
- Side-by-side search & filter

### Tablet (768-1023px)
- 2-column stats grid
- Horizontal scroll for table
- Stacked search & filter

### Mobile (<767px)
- 1-column stats grid
- Horizontal scroll for table
- Stacked layout

## 🎯 Margin Indicators

### Color Coding
- 🟢 **Green** (>30%) - High margin
- 🔵 **Blue** (15-30%) - Good margin
- 🟡 **Yellow** (<15%) - Low margin

## ⚡ Keyboard Shortcuts

- **Enter** in search → Filter immediately
- **Escape** in modal → Close modal
- **Tab** in forms → Navigate fields

## 🔔 Notifications

Uses `react-hot-toast` for feedback:
- ✅ Success: Green toast
- ❌ Error: Red toast
- ⏳ Loading: Spinner in button

## 📊 Best Practices

### When to Stock In
- ✅ Receiving supplier shipments
- ✅ Returns from customers
- ✅ Found inventory corrections

### When to Stock Out
- ✅ Damaged/expired products
- ✅ Samples given away
- ✅ Shrinkage/theft adjustments
- ❌ **NOT** for sales (POS handles this)

### Low Stock Alerts
**Default:** 10 units
**Adjust:** Per product in edit form
**Use:** Set based on lead time and sales velocity

### Notes Best Practices
- Include reason for adjustment
- Reference external docs (PO#, RMA#)
- Keep concise but informative

## 🚀 Performance Tips

- Search is instant (no API call)
- Sorting is client-side (fast)
- History loads on demand
- Stats calculate in real-time

## 🔐 Data Validation

### Frontend
- Required fields marked with *
- Number inputs prevent negatives
- Price/Cost require 2 decimal places

### Backend
- Unique SKU & Barcode
- Stock can't go negative
- All fields validated

## 📦 Dependencies

### Required Packages
```json
{
  "react": "^19.2.0",
  "lucide-react": "^0.556.0",
  "axios": "^1.13.2",
  "react-hot-toast": "^2.6.0",
  "daisyui": "^4.12.24",
  "tailwindcss": "^3.4.18"
}
```

## 🎨 DaisyUI Theme Classes

### Backgrounds
- `bg-base-100` - Card background
- `bg-base-200` - Page background
- `bg-base-content` - Text color

### Buttons
- `btn-primary` - Main actions
- `btn-success` - Stock in
- `btn-error` - Stock out/delete
- `btn-ghost` - Secondary actions
- `btn-outline` - Alternative style

### Status Badges
- `badge-success` - In stock
- `badge-warning` - Low stock
- `badge-error` - Out of stock

---

**Quick Start:** Just navigate to `/products` and everything works!
