import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import {
  Activity, TrendingUp, BarChart3, MapPin, Award, Package
} from 'lucide-react';
import axios from '../lib/axios';
import {
  calculateRevenueTrend, calculateCompanyComparison, generateInsights, calculateGrowth
} from '../lib/analyticsUtils';
import { MetricCard, ChartCard, InsightCard, SimpleChart, LoadingSkeleton } from '../components/DashboardComponents';
import {
  SimpleLineChart, SimplePieChart, SimpleAreaChart, CombinedLineAreaChart, HorizontalBarChart
} from '../components/Charts';

/**
 * MARKET / PLATFORM ANALYTICS DASHBOARD
 * 
 * Audience: Platform owner, Super admin, Executives
 * Purpose: Ecosystem health, Market trends, Company comparison
 * 
 * Data Policy: AGGREGATED ONLY
 * - No transaction history
 * - No receipts
 * - No hourly activity per store
 * - No product-level tables
 * - No company-specific drill-down
 */
const MarketAnalyticsDashboard = () => {
  const dashboardSections = [
    { key: 'overview', label: '📊 Platform Overview' },
    { key: 'revenue', label: '💰 Revenue Trends' },
    { key: 'market', label: '📈 Market Share' },
  ];

  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    transactions: [],
    companies: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [anchorTime, setAnchorTime] = useState(() => Date.now());

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    try {
      setLoading(true);
      const [transactionsRes, usersRes] = await Promise.all([
        axios.get('/transactions'),
        axios.get('/auth/users'),
      ]);

      const transactions = transactionsRes.data.data || [];
      const users = usersRes.data.data || [];

      // Extract unique companies (aggregated)
      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      const companies = [...new Set(nonAdminUsers.map((u) => u.company_name).filter(Boolean))].sort();

      setStats({
        transactions,
        companies,
      });
      setAnchorTime(Date.now());
    } catch (error) {
      console.error('Error fetching platform data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPeso = (amount) => {
    return '₱' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

  // AGGREGATED DATA ONLY - No company filtering
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

  // Analytics: AGGREGATED ACROSS ALL COMPANIES
  const revenueTrend = useMemo(() => calculateRevenueTrend(filteredTransactions, trendDays, anchorTime, timeRange), [filteredTransactions, trendDays, anchorTime, timeRange]);
  const companyStats = useMemo(() => calculateCompanyComparison(filteredTransactions, stats.companies), [filteredTransactions, stats.companies]);
  const platformInsights = useMemo(() => generateInsights(filteredTransactions, stats.companies, [], timeRange), [filteredTransactions, stats.companies, timeRange]);

  // Key metrics: PLATFORM LEVEL
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);
  }, [filteredTransactions]);

  const totalTransactions = useMemo(() => {
    return filteredTransactions.length;
  }, [filteredTransactions]);

  const avgTransactionValue = useMemo(() => {
    return totalTransactions ? totalRevenue / totalTransactions : 0;
  }, [totalTransactions, totalRevenue]);

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
    return calculateGrowth(totalTransactions, prevTransactionCount);
  }, [totalTransactions, prevTransactionCount]);

  const prevAverageTransactionValue = useMemo(() => {
    if (timeRange === 'all') return null;
    if (!prevTransactionCount || prevTransactionCount === 0) return null;
    if (prevRevenue === null) return null;
    return prevRevenue / prevTransactionCount;
  }, [timeRange, prevTransactionCount, prevRevenue]);

  const avgTransactionGrowth = useMemo(() => {
    if (prevAverageTransactionValue === null) return null;
    return calculateGrowth(avgTransactionValue, prevAverageTransactionValue);
  }, [avgTransactionValue, prevAverageTransactionValue]);

  const comparisonLabel = useMemo(() => {
    switch (timeRange) {
      case '24h': return 'vs previous 24h';
      case '7d': return 'vs previous week';
      case '30d': return 'vs previous 30 days';
      case 'all': return '';
      default: return 'vs previous period';
    }
  }, [timeRange]);

  // Market share: TOP 5 COMPANIES
  const marketShareData = useMemo(() => {
    const total = Object.values(companyStats).reduce((sum, c) => sum + c.revenue, 0);
    return Object.values(companyStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(c => ({
        name: c.name,
        value: total ? Math.round((c.revenue / total) * 100) : 0,
      }))
      .filter(c => c.value > 0); // Hide companies with 0% share
  }, [companyStats]);

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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Market Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Platform-wide insights and trends</p>
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
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
              <button
                onClick={fetchPlatformData}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW SECTION - AGGREGATED PLATFORM KPIs */}
        {activeSection === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Total Platform Revenue"
                value={formatPeso(totalRevenue)}
                change={revenueGrowth}
                changeLabel={comparisonLabel}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Total Transactions"
                value={totalTransactions.toLocaleString()}
                change={transactionGrowth}
                changeLabel={comparisonLabel}
                icon={Activity}
                color="blue"
              />
              <MetricCard
                label="Average Transaction Value"
                value={formatPeso(avgTransactionValue)}
                change={avgTransactionGrowth}
                changeLabel={comparisonLabel}
                icon={Award}
                color="purple"
              />
              <MetricCard
                label="Active Companies"
                value={stats.companies.length.toLocaleString()}
                icon={MapPin}
                color="orange"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Market Share (Top 5)" icon={BarChart3}>
                <SimplePieChart data={marketShareData} isDoughnut={true} />
              </ChartCard>
              <InsightCard insights={platformInsights} />
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
          </>
        )}

        {/* REVENUE TRENDS SECTION */}
        {activeSection === 'revenue' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Highest Revenue Day"
                value={formatPeso(revenueTrend.length > 0 ? Math.max(...revenueTrend.map(d => d.revenue)) : 0)}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Lowest Revenue Day"
                value={formatPeso(revenueTrend.filter(d => d.revenue > 0).length > 0 ? Math.min(...revenueTrend.filter(d => d.revenue > 0).map(d => d.revenue)) : 0)}
                icon={TrendingUp}
                color="orange"
              />
              <MetricCard
                label="Average Daily Revenue"
                value={formatPeso(totalRevenue / trendDays)}
                icon={Award}
                color="blue"
              />
              <MetricCard
                label="Revenue Volatility"
                value={((Math.max(...revenueTrend.map(d => d.revenue), 0) - Math.min(...revenueTrend.filter(d => d.revenue > 0).map(d => d.revenue), 0)) / (totalRevenue / revenueTrend.length || 1) * 100).toFixed(1) + '%'}
                icon={Package}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <ChartCard title="Revenue Trend Analysis" icon={TrendingUp}>
                <SimpleAreaChart data={revenueTrend} dataKey="revenue" color="#10b981" />
              </ChartCard>
            </div>
          </>
        )}

        {/* MARKET SHARE SECTION */}
        {activeSection === 'market' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Revenue Distribution by Company" icon={TrendingUp}>
                <HorizontalBarChart
                  data={Object.values(companyStats)
                    .sort((a, b) => b.revenue - a.revenue)
                    .map(c => ({
                      label: c.name,
                      displayValue: formatPeso(c.revenue),
                      value: c.revenue,
                    }))}
                  dataKey="value"
                  labelKey="label"
                  color="#3b82f6"
                />
              </ChartCard>
              <ChartCard title="Market Share Distribution" icon={BarChart3}>
                <SimplePieChart data={marketShareData} isDoughnut={true} />
              </ChartCard>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Performance Ranking</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Rank</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Company</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Revenue</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Transactions</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Avg Order Value</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Market Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {Object.values(companyStats)
                      .sort((a, b) => b.revenue - a.revenue)
                      .map((c, rank) => {
                        const totalRev = Object.values(companyStats).reduce((sum, x) => sum + x.revenue, 0);
                        return (
                          <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">#{rank + 1}</td>
                            <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                            <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">{formatPeso(c.revenue)}</td>
                            <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{Math.floor(c.transactions)}</td>
                            <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{formatPeso(c.avgTransaction)}</td>
                            <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">{((c.revenue / totalRev) * 100).toFixed(1)}%</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}


      </div>
    </div>
  );
};

export default MarketAnalyticsDashboard;
