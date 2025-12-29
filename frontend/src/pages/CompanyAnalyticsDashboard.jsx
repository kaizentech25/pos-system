import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import Navbar from '../components/Navbar';
import {
  Activity, Users, ShoppingCart, TrendingUp, Clock, BarChart3,
  Target, Zap, Award, Package, Eye, ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import axios from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import {
  calculateRevenueTrend, calculateHourlyDistribution, calculateProductAnalytics,
  generateInsights, calculateGrowth
} from '../lib/analyticsUtils';
import { MetricCard, ChartCard, InsightCard, SimpleChart, LoadingSkeleton } from '../components/DashboardComponents';
import {
  SimpleLineChart, SimpleAreaChart, SimpleBarChart, HourlyHeatmapChart
} from '../components/Charts';
import ReceiptModal from '../components/ReceiptModal';

/**
 * MY BUSINESS ANALYTICS DASHBOARD
 * 
 * Audience: Business owner, Manager, Accountant
 * Purpose: Operate, audit, and optimize ONE business
 * 
 * Data Policy: COMPANY-SCOPED ONLY
 * - Single company context (no comparisons with competitors)
 * - Deep operational details
 * - Transaction history with receipts
 * - Hourly activity heatmap
 * - Detailed product tables
 */
const CompanyAnalyticsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Access control: only allow if user has a company
  if (!user?.company_name) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-full mx-auto px-4 md:px-6 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-800 dark:text-red-200 font-semibold">Access Denied</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-2">This dashboard requires a company assignment.</p>
          </div>
        </div>
      </div>
    );
  }

  const dashboardSections = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'sales', label: '📈 Sales & Activity' },
    { key: 'products', label: '📦 Product Performance' },
    { key: 'transactions', label: '📝 Transactions & Receipts' },
    { key: 'insights', label: '💡 Insights & Alerts' },
  ];

  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    users: [],
    products: [],
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [anchorTime, setAnchorTime] = useState(() => Date.now());

  // Receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  // Sorting state
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    fetchCompanyData();
  }, [user?.company_name]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const [usersRes, transactionsRes, productsRes] = await Promise.all([
        axios.get('/auth/users'),
        axios.get('/transactions'),
        axios.get('/products'),
      ]);

      const users = usersRes.data.data || [];
      const transactions = transactionsRes.data.data || [];
      const products = productsRes.data.data || [];

      // COMPANY-SCOPED: Only this user's company data
      const companyUsers = users.filter(u => u.company_name === user?.company_name);
      const companyTransactions = transactions.filter(t => t.company_name === user?.company_name);

      setStats({
        users: companyUsers,
        products: products,
        transactions: companyTransactions,
      });
      setAnchorTime(Date.now());
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime12h = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Manila'
    });
  };

  const formatPeso = (amount) => {
    return '₱' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateString) => {
    return formatTime12h(dateString);
  };

  const getTimeRangeStart = (anchor) => {
    const now = anchor ? new Date(anchor) : new Date();
    switch (timeRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'all':
        return new Date(0);
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
  };

  const timeRangeStart = useMemo(() => getTimeRangeStart(anchorTime), [timeRange, anchorTime]);

  // COMPANY-SCOPED DATA ONLY
  const filteredTransactions = useMemo(() => {
    return stats.transactions.filter((t) => {
      const created = new Date(t.createdAt);
      return created >= timeRangeStart;
    });
  }, [stats.transactions, timeRangeStart]);

  const trendDays = useMemo(() => {
    switch (timeRange) {
      case '24h':
        return 1;
      case '7d':
        return 7;
      case '30d':
        return 30;
      case 'all':
        if (filteredTransactions.length === 0) return 30;
        const dates = filteredTransactions.map(t => new Date(t.createdAt).getTime());
        const minDate = Math.min(...dates);
        const maxDate = Math.max(...dates);
        const daysDiff = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
        return Math.max(daysDiff, 7);
      default:
        return 7;
    }
  }, [timeRange, filteredTransactions]);

  // Analytics: FOR THIS COMPANY ONLY
  const revenueTrend = useMemo(() => calculateRevenueTrend(filteredTransactions, trendDays, anchorTime, timeRange), [filteredTransactions, trendDays, anchorTime, timeRange]);
  const hourlyDist = useMemo(() => calculateHourlyDistribution(filteredTransactions), [filteredTransactions]);
  const productAnalytics = useMemo(() => calculateProductAnalytics(filteredTransactions), [filteredTransactions]);
  const companyInsights = useMemo(() => generateInsights(filteredTransactions, [user?.company_name], stats.products, timeRange), [filteredTransactions, user?.company_name, stats.products, timeRange]);

  // Key metrics
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);
  }, [filteredTransactions]);

  const avgTransaction = useMemo(() => {
    return filteredTransactions.length ? totalRevenue / filteredTransactions.length : 0;
  }, [filteredTransactions, totalRevenue]);

  const prevRevenue = useMemo(() => {
    // Don't calculate comparison for 'all' time range
    if (timeRange === 'all') return null;
    
    const prevStart = new Date(timeRangeStart);
    const daysToSubtract = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    prevStart.setDate(prevStart.getDate() - daysToSubtract);
    
    return stats.transactions
      .filter(t => {
        const created = new Date(t.createdAt);
        return created >= prevStart && created < timeRangeStart;
      })
      .reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);
  }, [stats.transactions, timeRange, timeRangeStart]);

  const prevTransactionCount = useMemo(() => {
    // Don't calculate comparison for 'all' time range
    if (timeRange === 'all') return null;
    
    const prevStart = new Date(timeRangeStart);
    const daysToSubtract = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30;
    prevStart.setDate(prevStart.getDate() - daysToSubtract);
    
    return stats.transactions.filter(t => {
      const created = new Date(t.createdAt);
      return created >= prevStart && created < timeRangeStart;
    }).length;
  }, [stats.transactions, timeRange, timeRangeStart]);

  const revenueGrowth = useMemo(() => {
    if (prevRevenue === null) return null;
    return calculateGrowth(totalRevenue, prevRevenue);
  }, [totalRevenue, prevRevenue]);

  const transactionGrowth = useMemo(() => {
    if (prevTransactionCount === null) return null;
    return calculateGrowth(filteredTransactions.length, prevTransactionCount);
  }, [filteredTransactions.length, prevTransactionCount]);

  const prevAverageTransaction = useMemo(() => {
    if (timeRange === 'all') return null;
    if (!prevTransactionCount || prevTransactionCount === 0) return null;
    if (prevRevenue === null) return null;
    return prevRevenue / prevTransactionCount;
  }, [timeRange, prevTransactionCount, prevRevenue]);

  const avgTransactionGrowth = useMemo(() => {
    if (prevAverageTransaction === null) return null;
    return calculateGrowth(avgTransaction, prevAverageTransaction);
  }, [avgTransaction, prevAverageTransaction]);

  const comparisonLabel = useMemo(() => {
    switch (timeRange) {
      case '24h': return 'vs previous 24h';
      case '7d': return 'vs previous week';
      case '30d': return 'vs previous 30 days';
      case 'all': return '';
      default: return 'vs previous period';
    }
  }, [timeRange]);

  // Transaction table helpers
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const sortedTransactions = useMemo(() => {
    const sorted = [...filteredTransactions].sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'totalAmount':
          aVal = a.totalAmount || a.total || 0;
          bVal = b.totalAmount || b.total || 0;
          break;
        case 'transactionId':
          aVal = a.transactionId || a._id;
          bVal = b.transactionId || b._id;
          break;
        default:
          return 0;
      }

      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return sorted;
  }, [filteredTransactions, sortField, sortDirection]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return sortedTransactions.slice(startIndex, endIndex);
  }, [sortedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

  const handleViewReceipt = (transaction) => {
    const receipt = {
      transactionId: transaction.transactionId || transaction._id,
      timestamp: transaction.createdAt,
      company_name: transaction.company_name,
      cashierName: transaction.cashierName || 'N/A',
      items: transaction.items || [],
      subtotal: transaction.subtotal || transaction.totalAmount || transaction.total || 0,
      tax: transaction.tax || 0,
      discount: transaction.discount || 0,
      total: transaction.totalAmount || transaction.total || 0,
      paymentMethod: transaction.paymentMethod || 'Cash',
      amountPaid: transaction.amountPaid || transaction.totalAmount || transaction.total || 0,
      change: transaction.change || 0,
    };

    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const getProductsSummary = (items) => {
    if (!items || items.length === 0) return 'N/A';
    if (items.length === 1) return items[0].name;
    if (items.length === 2) return `${items[0].name}, ${items[1].name}`;
    return `${items[0].name}, ${items[1].name} +${items.length - 2} more`;
  };

  const getTotalQuantity = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-full mx-auto px-4 md:px-6 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-full mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{user?.company_name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Business analytics and operations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={activeSection}
                onChange={e => setActiveSection(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
              >
                {dashboardSections.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <select
                value={timeRange}
                onChange={(e) => {
                  setTimeRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchCompanyData}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW SECTION - COMPANY KPIs */}
        {activeSection === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Total Revenue"
                value={formatPeso(totalRevenue)}
                change={revenueGrowth}
                changeLabel={comparisonLabel}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Transactions"
                value={filteredTransactions.length.toLocaleString()}
                change={transactionGrowth}
                changeLabel={comparisonLabel}
                icon={ShoppingCart}
                color="blue"
              />
              <MetricCard
                label="Average Order Value"
                value={formatPeso(avgTransaction)}
                change={avgTransactionGrowth}
                changeLabel={comparisonLabel}
                icon={Target}
                color="purple"
              />
              <MetricCard
                label="Staff Members"
                value={stats.users.length.toLocaleString()}
                icon={Users}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Revenue Trend" icon={TrendingUp}>
                <SimpleLineChart data={revenueTrend} dataKey="revenue" color="#3b82f6" />
              </ChartCard>
              <ChartCard title="Daily Transaction Volume" icon={Activity}>
                <SimpleAreaChart data={revenueTrend} dataKey="transactions" color="#8b5cf6" />
              </ChartCard>
            </div>
          </>
        )}

        {/* SALES & ACTIVITY SECTION */}
        {activeSection === 'sales' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                label="Peak Hour"
                value={`${hourlyDist.reduce((max, h) => h.count > max.count ? h : max, hourlyDist[0]).hour}:00`}
                icon={Clock}
                color="blue"
              />
              <MetricCard
                label="Peak Hour Revenue"
                value={formatPeso(hourlyDist.reduce((max, h) => h.revenue > max.revenue ? h : max, hourlyDist[0]).revenue)}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Avg Hourly Transactions"
                value={Math.floor(filteredTransactions.length / 24).toLocaleString()}
                icon={Activity}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Hourly Transaction Distribution" icon={Activity}>
                <SimpleBarChart
                  data={hourlyDist.map(h => ({
                    label: `${h.hour}:00`,
                    value: h.count,
                  }))}
                  dataKey="value"
                  color="#f59e0b"
                />
              </ChartCard>
              <ChartCard title="Hourly Revenue" icon={TrendingUp}>
                <SimpleBarChart
                  data={hourlyDist.map(h => ({
                    label: `${h.hour}:00`,
                    value: h.revenue,
                  }))}
                  dataKey="value"
                  color="#8b5cf6"
                />
              </ChartCard>
            </div>

            <ChartCard title="Activity Heatmap" icon={Zap}>
              <HourlyHeatmapChart data={hourlyDist} />
            </ChartCard>
          </>
        )}

        {/* PRODUCT PERFORMANCE SECTION */}
        {activeSection === 'products' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                label="Top Product Revenue"
                value={formatPeso(productAnalytics[0]?.revenue || 0)}
                icon={Award}
                color="blue"
              />
              <MetricCard
                label="Avg Quantity/Sale"
                value={Math.floor(productAnalytics.reduce((sum, p) => sum + (p.quantity / p.transactions), 0) / Math.max(productAnalytics.length, 1))}
                icon={Package}
                color="orange"
              />
              <MetricCard
                label="Unique Products Sold"
                value={productAnalytics.length.toLocaleString()}
                icon={Zap}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Top 10 Products by Revenue" icon={Package}>
                <SimpleChart
                  data={productAnalytics.slice(0, 10).map((p) => ({
                    label: p.name.slice(0, 14),
                    displayValue: `₱${(p.revenue / 1000).toFixed(1)}K`,
                    value: p.revenue,
                  }))}
                  type="bar"
                />
              </ChartCard>
              <ChartCard title="Top 10 Products by Units Sold" icon={ShoppingCart}>
                <SimpleChart
                  data={[...productAnalytics]
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 10)
                    .map((p) => ({
                      label: p.name.slice(0, 14),
                      displayValue: `${Math.floor(p.quantity)} units`,
                      value: p.quantity,
                    }))}
                  type="bar"
                />
              </ChartCard>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">All Products Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Product</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Units</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {productAnalytics.map((p) => (
                      <tr key={p.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">{p.name}</td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{Math.floor(p.quantity)}</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">{formatPeso(p.revenue)}</td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{Math.floor(p.transactions)}</td>
                        <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{formatPeso(p.revenue / p.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TRANSACTIONS & RECEIPTS SECTION */}
        {activeSection === 'transactions' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Total Transactions"
                value={sortedTransactions.length.toLocaleString()}
                icon={ShoppingCart}
                color="blue"
              />
              <MetricCard
                label="Total Revenue"
                value={formatPeso(totalRevenue)}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Average Transaction"
                value={formatPeso(avgTransaction)}
                icon={Target}
                color="purple"
              />
              <MetricCard
                label="Items Sold"
                value={Math.floor(sortedTransactions.reduce((sum, t) => sum + getTotalQuantity(t.items), 0)).toLocaleString()}
                icon={Package}
                color="orange"
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Transaction History
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Showing {paginatedTransactions.length} of {sortedTransactions.length} transactions
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th
                        className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-2">
                          Date & Time
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th
                        className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('transactionId')}
                      >
                        <div className="flex items-center gap-2">
                          Transaction ID
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Products
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Quantity
                      </th>
                      <th
                        className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => handleSort('totalAmount')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Total Amount
                          <ArrowUpDown className="w-4 h-4" />
                        </div>
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Payment
                      </th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedTransactions.length > 0 ? (
                      paginatedTransactions.map((transaction) => (
                        <tr
                          key={transaction._id || transaction.transactionId}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                              {(transaction.transactionId || transaction._id || 'N/A').slice(0, 12)}...
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900 dark:text-white max-w-xs">
                            <div className="truncate" title={getProductsSummary(transaction.items)}>
                              {getProductsSummary(transaction.items)}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-gray-600 dark:text-gray-400">
                            {getTotalQuantity(transaction.items)}
                          </td>
                          <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                            {formatPeso(transaction.totalAmount || transaction.total || 0)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                              {transaction.paymentMethod || 'Cash'}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <button
                              onClick={() => handleViewReceipt(transaction)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Receipt
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-500 dark:text-gray-400">
                          No transactions found for the selected time period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                      {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* INSIGHTS & ALERTS SECTION */}
        {activeSection === 'insights' && (
          <>
            <InsightCard insights={companyInsights} />
          </>
        )}
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
      />
    </div>
  );
};

export default CompanyAnalyticsDashboard;
