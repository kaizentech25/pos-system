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
  SimpleLineChart, SimpleAreaChart, SimpleBarChart, HourlyHeatmapChart, CombinedLineAreaChart, HorizontalBarChart
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

  const role = user?.role;
  const isAdmin = role === 'admin';

  // Access control: allow admin even without a company (admin can monitor others)
  if (!isAdmin && !user?.company_name) {
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
  ];

  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    users: [],
    products: [],
    transactions: [],
  });
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(isAdmin ? false : true);
  const [timeRange, setTimeRange] = useState('7d');
  const [anchorTime, setAnchorTime] = useState(() => Date.now());
  const [activityView, setActivityView] = useState('daily');
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 10;

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
    if (isAdmin) {
      fetchCompanies();
    }
  }, [isAdmin]);

  useEffect(() => {
    // Admin needs a selected company; non-admin uses their own
    if (!isAdmin && !user?.company_name) return;
    if (isAdmin && !selectedCompany) {
      setLoading(false);
      return;
    }
    fetchCompanyData();
  }, [user?.company_name, selectedCompany]);

  useEffect(() => {
    setActivityView(timeRange === '24h' ? 'hourly' : 'daily');
  }, [timeRange]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const targetCompany = isAdmin ? selectedCompany : user?.company_name;

      if (!targetCompany) {
        setStats({ users: [], products: [], transactions: [] });
        setLoading(false);
        return;
      }

      const [usersRes, transactionsRes, productsRes] = await Promise.all([
        axios.get('/auth/users'),
        axios.get('/transactions', { params: { company_name: targetCompany } }),
        axios.get('/products', { params: { company_name: targetCompany } }),
      ]);

      const users = usersRes.data.data || [];
      const transactions = transactionsRes.data.data || [];
      const products = productsRes.data.data || [];

      // COMPANY-SCOPED: Only target company data
      const companyUsers = users.filter(u => u.company_name === targetCompany);
      const companyTransactions = transactions.filter(t => t.company_name === targetCompany);
      const companyProducts = products.filter(p => p.company_name === targetCompany);

      setStats({
        users: companyUsers,
        products: companyProducts,
        transactions: companyTransactions,
      });
      setAnchorTime(Date.now());
    } catch (error) {
      console.error('Error fetching company data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/auth/users');
      const users = response.data.data || [];
      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      const uniqueCompanies = [...new Set(nonAdminUsers.map(u => u.company_name).filter(Boolean))].sort();
      setCompanies(uniqueCompanies);

      if (!selectedCompany && uniqueCompanies.length > 0) {
        setSelectedCompany(uniqueCompanies[0]);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
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
    if (typeof amount !== 'number' || isNaN(amount)) return '₱0.00';
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
  const dailyActivity = useMemo(() => {
    const now = anchorTime ? new Date(anchorTime) : new Date();

    const formatLocalDateKey = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const data = [];

    for (let i = trendDays - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateKey = formatLocalDateKey(date);

      const dayTransactions = filteredTransactions.filter((t) => {
        const tKey = formatLocalDateKey(new Date(t.createdAt));
        return tKey === dateKey;
      });

      const revenue = dayTransactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);

      data.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayTransactions.length,
        revenue,
      });
    }

    return data;
  }, [filteredTransactions, trendDays, anchorTime]);
  const peakHour = useMemo(() => hourlyDist.reduce((max, h) => (h.count > max.count ? h : max), hourlyDist[0] || { hour: 0, count: 0, revenue: 0 }), [hourlyDist]);
  const peakHourRevenue = useMemo(() => hourlyDist.reduce((max, h) => (h.revenue > max.revenue ? h : max), hourlyDist[0] || { hour: 0, count: 0, revenue: 0 }), [hourlyDist]);
  const peakDay = useMemo(() => dailyActivity.reduce((max, d) => (d.count > max.count ? d : max), dailyActivity[0] || { label: 'N/A', count: 0, revenue: 0 }), [dailyActivity]);
  const peakDayRevenue = useMemo(() => dailyActivity.reduce((max, d) => (d.revenue > max.revenue ? d : max), dailyActivity[0] || { label: 'N/A', count: 0, revenue: 0 }), [dailyActivity]);
  const avgHourlyTransactions = useMemo(() => {
    const hours = Math.max(1, trendDays * 24);
    return filteredTransactions.length / hours;
  }, [filteredTransactions.length, trendDays]);
  const avgDailyTransactions = useMemo(() => {
    if (!dailyActivity.length) return 0;
    return dailyActivity.reduce((sum, d) => sum + d.count, 0) / dailyActivity.length;
  }, [dailyActivity]);
  const productAnalytics = useMemo(() => calculateProductAnalytics(filteredTransactions), [filteredTransactions]);
  const avgQuantityPerSale = useMemo(() => {
    const totalQty = productAnalytics.reduce((sum, p) => sum + p.quantity, 0);
    const totalTx = productAnalytics.reduce((sum, p) => sum + p.transactions, 0);
    return totalTx > 0 ? totalQty / totalTx : 0;
  }, [productAnalytics]);

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

  // Company-specific insights (not comparative)
  const companyInsights = useMemo(() => {
    const insights = [];
    
    // Time period context
    const timePeriodText = (() => {
      switch (timeRange) {
        case '24h': return 'in the last 24 hours';
        case '7d': return 'in the last 7 days';
        case '30d': return 'in the last 30 days';
        case 'all': return 'in all time';
        default: return 'in the selected period';
      }
    })();
    
    // Revenue performance
    if (totalRevenue > 0) {
      insights.push(`💰 Total revenue of ₱${totalRevenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })} generated from ${filteredTransactions.length.toLocaleString()} transactions ${timePeriodText}.`);
    } else {
      insights.push(`📊 No revenue recorded ${timePeriodText}.`);
    }
    
    // Top product
    const topProduct = productAnalytics[0];
    if (topProduct) {
      insights.push(`⭐ Best-selling product ${timePeriodText}: ${topProduct.name} with ${Math.floor(topProduct.quantity).toLocaleString()} units sold (₱${topProduct.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })} revenue).`);
    }
    
    // Peak hour
    if (hourlyDist.length > 0) {
      const peakHour = hourlyDist.reduce((max, h) => h.count > max.count ? h : max, hourlyDist[0]);
      if (peakHour.count > 0) {
        const hour12 = peakHour.hour % 12 === 0 ? 12 : peakHour.hour % 12;
        const ampm = peakHour.hour < 12 ? 'AM' : 'PM';
        insights.push(`⏰ Peak business hour ${timePeriodText}: ${hour12}:00 ${ampm} with ${peakHour.count.toLocaleString()} transactions (₱${peakHour.revenue.toLocaleString('en-PH', { maximumFractionDigits: 0 })}).`);
      }
    }
    
    // Average transaction
    if (avgTransaction > 0) {
      insights.push(`📊 Average order value ${timePeriodText}: ₱${avgTransaction.toLocaleString('en-PH', { maximumFractionDigits: 2 })} per transaction.`);
    }
    
    // Growth indicators
    if (revenueGrowth !== null) {
      const growthText = revenueGrowth >= 0 ? 'increased' : 'decreased';
      const growthEmoji = revenueGrowth >= 0 ? '📈' : '📉';
      insights.push(`${growthEmoji} Revenue ${growthText} by ${Math.abs(revenueGrowth).toFixed(1)}% ${comparisonLabel}.`);
    }
    
    return insights;
  }, [filteredTransactions, totalRevenue, productAnalytics, hourlyDist, avgTransaction, revenueGrowth, comparisonLabel, timeRange]);

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
      items: (transaction.items || []).map(item => ({
        productName: item.productName || item.name || 'Unknown',
        productSku: item.productSku || item.sku || 'N/A',
        quantity: item.quantity || 0,
        price: item.price || 0,
        subtotal: item.subtotal || (item.price * item.quantity) || 0,
      })),
      subtotal: transaction.subtotal || 0,
      vat: transaction.vat || transaction.tax || 0,
      tax: transaction.vat || transaction.tax || 0,
      discount: transaction.discount || 0,
      total: transaction.totalAmount || transaction.total || 0,
      paymentMethod: transaction.paymentMethod || 'Cash',
      cashReceived: transaction.cashReceived || transaction.amountPaid || transaction.totalAmount || transaction.total || 0,
      amountPaid: transaction.amountPaid || transaction.cashReceived || transaction.totalAmount || transaction.total || 0,
      change: transaction.change || 0,
    };

    setSelectedReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  const getProductsSummary = (items) => {
    if (!items || items.length === 0) return 'N/A';
    const getName = (item) => item.productName || item.name || 'Unknown';
    if (items.length === 1) return getName(items[0]);
    if (items.length === 2) return `${getName(items[0])}, ${getName(items[1])}`;
    return `${getName(items[0])}, ${getName(items[1])} +${items.length - 2} more`;
  };

  const getTotalQuantity = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Helper to format hour in 12-hour AM/PM format
  const formatHour12 = (hour) => {
    const h = parseInt(hour, 10);
    if (isNaN(h)) return hour;
    const ampm = h < 12 ? 'AM' : 'PM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:00 ${ampm}`;
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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                {isAdmin ? (selectedCompany || 'Select a company to view analytics') : user?.company_name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Business analytics and operations</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {isAdmin && (
                <select
                  value={selectedCompany}
                  onChange={e => setSelectedCompany(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
                >
                  <option value="">Select a company</option>
                  {companies.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
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
          {isAdmin && !selectedCompany && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
              Select a company to load analytics.
            </div>
          )}
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

            <div className="grid grid-cols-1 gap-6 mb-8">
              <ChartCard title="Revenue & Transactions" icon={TrendingUp}>
                <CombinedLineAreaChart
                  data={revenueTrend}
                  lineKey="revenue"
                  areaKey="transactions"
                  lineColor="#3b82f6"
                  areaColor="#f59e0b"
                  mode="dual-lines"
                />
              </ChartCard>
            </div>

            <InsightCard insights={companyInsights} />
          </>
        )}

        {/* SALES & ACTIVITY SECTION */}
        {activeSection === 'sales' && (
          <>
            <div className="flex justify-end mb-4">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
                <button
                  onClick={() => setActivityView('hourly')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activityView === 'hourly' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Hourly
                </button>
                <button
                  onClick={() => setActivityView('daily')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activityView === 'daily' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  Daily
                </button>
              </div>
            </div>

            {activityView === 'hourly' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  label="Peak Hour"
                  value={formatHour12(peakHour.hour)}
                  icon={Clock}
                  color="blue"
                />
                <MetricCard
                  label="Peak Hour Revenue"
                  value={formatPeso(peakHourRevenue.revenue)}
                  icon={TrendingUp}
                  color="green"
                />
                <MetricCard
                  label="Avg Hourly Transactions"
                  value={avgHourlyTransactions.toFixed(1)}
                  icon={Activity}
                  color="purple"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <MetricCard
                  label="Peak Day"
                  value={peakDay.label || 'N/A'}
                  icon={BarChart3}
                  color="blue"
                />
                <MetricCard
                  label="Peak Day Revenue"
                  value={formatPeso(peakDayRevenue.revenue)}
                  icon={TrendingUp}
                  color="green"
                />
                <MetricCard
                  label="Avg Daily Transactions"
                  value={Math.floor(avgDailyTransactions).toLocaleString()}
                  icon={Activity}
                  color="purple"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title={activityView === 'hourly' ? 'Hourly Transaction Distribution' : 'Daily Transaction Distribution'} icon={Activity}>
                {activityView === 'hourly' ? (
                  <SimpleBarChart
                    data={hourlyDist.map(h => ({
                      label: formatHour12(h.hour),
                      value: h.count,
                    }))}
                    dataKey="value"
                    color="#f59e0b"
                    valueType="number"
                    valueLabel="Transactions"
                  />
                ) : (
                  <SimpleBarChart
                    data={dailyActivity.map(d => ({
                      label: d.label,
                      value: d.count,
                    }))}
                    dataKey="value"
                    color="#f59e0b"
                    valueType="number"
                    valueLabel="Transactions"
                  />
                )}
              </ChartCard>
              <ChartCard title={activityView === 'hourly' ? 'Hourly Revenue' : 'Daily Revenue'} icon={TrendingUp}>
                {activityView === 'hourly' ? (
                  <SimpleBarChart
                    data={hourlyDist.map(h => ({
                      label: formatHour12(h.hour),
                      value: h.revenue,
                    }))}
                    dataKey="value"
                    color="#8b5cf6"
                    valueType="currency"
                    valueLabel="Revenue"
                  />
                ) : (
                  <SimpleBarChart
                    data={dailyActivity.map(d => ({
                      label: d.label,
                      value: d.revenue,
                    }))}
                    dataKey="value"
                    color="#8b5cf6"
                    valueType="currency"
                    valueLabel="Revenue"
                  />
                )}
              </ChartCard>
            </div>

            <ChartCard title="Activity Heatmap" icon={Zap}>
              <HourlyHeatmapChart
                data={hourlyDist.map(h => ({
                  ...h,
                  hour: formatHour12(h.hour).replace(':00', ''),
                }))}
              />
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
                value={Math.floor(avgQuantityPerSale)}
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
                <HorizontalBarChart
                  data={productAnalytics.slice(0, 10).map((p) => ({
                    label: p.name,
                    value: p.revenue,
                    displayValue: `₱${p.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  }))}
                  dataKey="value"
                  color="#3b82f6"
                  labelKey="label"
                />
              </ChartCard>
              <ChartCard title="Top 10 Products by Units Sold" icon={ShoppingCart}>
                <HorizontalBarChart
                  data={[...productAnalytics]
                    .sort((a, b) => b.quantity - a.quantity)
                    .slice(0, 10)
                    .map((p) => ({
                      label: p.name,
                      value: p.quantity,
                      displayValue: `${Math.floor(p.quantity).toLocaleString()} units`,
                    }))}
                  dataKey="value"
                  color="#f59e0b"
                  labelKey="label"
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
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">% Units</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">% Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {(() => {
                      const totalUnits = productAnalytics.reduce((sum, p) => sum + p.quantity, 0);
                      const totalRevenue = productAnalytics.reduce((sum, p) => sum + p.revenue, 0);
                      return productAnalytics
                        .slice((productPage - 1) * productsPerPage, productPage * productsPerPage)
                        .map((p) => {
                          const percentUnits = totalUnits > 0 ? (p.quantity / totalUnits) * 100 : 0;
                          const percentRevenue = totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0;
                          return (
                            <tr key={p.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-3 px-4 text-gray-900 dark:text-white">{p.name}</td>
                              <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{Math.floor(p.quantity).toLocaleString()}</td>
                              <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{percentUnits.toFixed(1)}%</td>
                              <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">{formatPeso(p.revenue)}</td>
                              <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{percentRevenue.toFixed(1)}%</td>
                              <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{Math.floor(p.transactions).toLocaleString()}</td>
                              <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{formatPeso(p.quantity > 0 ? p.revenue / p.quantity : 0)}</td>
                            </tr>
                          );
                        });
                    })()}
                  </tbody>
                </table>
              </div>
              {productAnalytics.length > productsPerPage && (
                <div className="px-4 pt-4 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600 dark:text-gray-400 gap-2">
                  <span>
                    {(() => {
                      const start = (productPage - 1) * productsPerPage + 1;
                      const end = Math.min(productPage * productsPerPage, productAnalytics.length);
                      return `Showing ${start}-${end} of ${productAnalytics.length} products`;
                    })()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      disabled={productPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      {productPage} of {Math.ceil(productAnalytics.length / productsPerPage)}
                    </span>
                    <button
                      onClick={() => setProductPage((p) => Math.min(Math.ceil(productAnalytics.length / productsPerPage), p + 1))}
                      disabled={productPage === Math.ceil(productAnalytics.length / productsPerPage)}
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
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between text-sm text-gray-600 dark:text-gray-400 gap-2">
                  <span>
                    {(() => {
                      const start = (currentPage - 1) * itemsPerPage + 1;
                      const end = Math.min(currentPage * itemsPerPage, sortedTransactions.length);
                      return `Showing ${start}-${end} of ${sortedTransactions.length} transactions`;
                    })()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      {currentPage} of {totalPages}
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
