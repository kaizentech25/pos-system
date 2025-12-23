import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import {
  Activity, Users, ShoppingCart, TrendingUp, Clock, BarChart3, CheckCircle2,
  Target, Zap, Award, Package, MapPin
} from 'lucide-react';
import axios from '../lib/axios';
import {
  calculateRevenueTrend, calculateHourlyDistribution, calculateProductAnalytics,
  calculateCompanyComparison, generateInsights, calculateGrowth, formatMetric
} from '../lib/analyticsUtils';
import { MetricCard, ChartCard, InsightCard, SimpleChart, LoadingSkeleton } from '../components/DashboardComponents';
import {
  SimpleLineChart, SimpleAreaChart, SimpleBarChart, SimplePieChart, HourlyHeatmapChart
} from '../components/Charts';

const ManagerAnalyticsDashboard = () => {
  const dashboardSections = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'revenue', label: '💰 Revenue Analytics' },
    { key: 'products', label: '📦 Product Performance' },
    { key: 'companies', label: '🏢 Company Comparison' },
    { key: 'hourly', label: '⏰ Activity Timeline' },
    { key: 'insights', label: '💡 Insights & Alerts' },
  ];

  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    users: [],
    products: [],
    transactions: [],
    companies: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  // Real-time clock
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoringData = async () => {
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

      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      const companies = [...new Set(nonAdminUsers.map((u) => u.company_name).filter(Boolean))].sort();

      setStats({
        users: nonAdminUsers,
        transactions,
        products,
        companies,
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
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

  const getTimeRangeStart = () => {
    const now = new Date();
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

  // Filter data
  const filteredTransactions = useMemo(() => {
    return stats.transactions.filter((t) => {
      const matchesCompany = selectedCompany === 'all' || t.company_name === selectedCompany;
      const created = new Date(t.createdAt);
      return matchesCompany && created >= getTimeRangeStart();
    });
  }, [stats.transactions, selectedCompany, timeRange]);

  const filteredUsers = useMemo(() => {
    if (selectedCompany === 'all') return stats.users;
    return stats.users.filter((u) => u.company_name === selectedCompany);
  }, [stats.users, selectedCompany]);

  // Analytics calculations
  const revenueTrend = useMemo(() => calculateRevenueTrend(filteredTransactions, 7), [filteredTransactions]);
  const hourlyDist = useMemo(() => calculateHourlyDistribution(filteredTransactions), [filteredTransactions]);
  const productAnalytics = useMemo(() => calculateProductAnalytics(filteredTransactions), [filteredTransactions]);
  const companyStats = useMemo(() => calculateCompanyComparison(filteredTransactions, stats.companies), [filteredTransactions, stats.companies]);
  const insights = useMemo(() => generateInsights(filteredTransactions, stats.companies, stats.products, timeRange), [filteredTransactions, stats.companies, stats.products, timeRange]);

  // Key metrics
  const totalRevenue = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);
  }, [filteredTransactions]);

  const avgTransaction = useMemo(() => {
    return filteredTransactions.length ? totalRevenue / filteredTransactions.length : 0;
  }, [filteredTransactions, totalRevenue]);

  const prevRevenue = useMemo(() => {
    const prevStart = new Date(getTimeRangeStart());
    prevStart.setDate(prevStart.getDate() - (timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : 30));
    return stats.transactions
      .filter(t => {
        const created = new Date(t.createdAt);
        return created >= prevStart && created < getTimeRangeStart();
      })
      .reduce((sum, t) => sum + (t.totalAmount || t.total || 0), 0);
  }, [stats.transactions, timeRange]);

  const revenuGrowth = useMemo(() => calculateGrowth(totalRevenue, prevRevenue), [totalRevenue, prevRevenue]);

  // Market share data
  const marketShareData = useMemo(() => {
    const total = Object.values(companyStats).reduce((sum, c) => sum + c.revenue, 0);
    return Object.values(companyStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(c => ({
        name: c.name.slice(0, 12),
        value: total ? Math.round((c.revenue / total) * 100) : 0,
      }));
  }, [companyStats]);

  // Top products
  const topProducts = useMemo(() => {
    return productAnalytics.slice(0, 5).map((p, idx) => ({
      ...p,
      label: p.name.slice(0, 15),
      displayValue: `₱${(p.revenue / 1000).toFixed(1)}K`,
      value: p.revenue,
    }));
  }, [productAnalytics]);

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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Business Insights</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Multi-company POS analytics dashboard</p>
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
              {stats.companies.length > 1 && (
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="all">All Companies</option>
                  {stats.companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              )}
              <button
                onClick={() => {
                  fetchMonitoringData();
                }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* OVERVIEW SECTION */}
        {activeSection === 'overview' && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Total Revenue"
                value={formatPeso(totalRevenue)}
                change={revenuGrowth}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Transactions"
                value={Math.floor(filteredTransactions.length).toLocaleString()}
                change={calculateGrowth(filteredTransactions.length, prevRevenue / (avgTransaction || 1))}
                icon={ShoppingCart}
                color="blue"
              />
              <MetricCard
                label="Average Order Value"
                value={formatPeso(avgTransaction)}
                icon={Target}
                color="purple"
              />
              <MetricCard
                label="Active Users"
                value={Math.floor(filteredUsers.length).toLocaleString()}
                icon={Users}
                color="orange"
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Revenue Trend" icon={TrendingUp}>
                <SimpleLineChart data={revenueTrend} dataKey="revenue" color="#3b82f6" />
              </ChartCard>
              <ChartCard title="Market Share (Top 5)" icon={BarChart3}>
                <SimplePieChart data={marketShareData} />
              </ChartCard>
            </div>

            {/* Transaction volume & Top products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Daily Transaction Volume" icon={Activity}>
                <SimpleAreaChart data={revenueTrend} dataKey="transactions" color="#8b5cf6" />
              </ChartCard>
              <ChartCard title="Top 5 Products by Revenue" icon={Package}>
                <SimpleChart data={topProducts} type="bar" />
              </ChartCard>
            </div>
          </>
        )}

        {/* REVENUE ANALYTICS SECTION */}
        {activeSection === 'revenue' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricCard
                label="Highest Revenue Day"
                value={formatPeso(Math.max(...revenueTrend.map(d => d.revenue), 0))}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Lowest Revenue Day"
                value={formatPeso(Math.min(...revenueTrend.filter(d => d.revenue > 0).map(d => d.revenue), 0))}
                icon={TrendingUp}
                color="orange"
              />
              <MetricCard
                label="Total Companies"
                value={stats.companies.length.toLocaleString()}
                icon={MapPin}
                color="blue"
              />
              <MetricCard
                label="Revenue Variance"
                value={((Math.max(...revenueTrend.map(d => d.revenue), 0) - Math.min(...revenueTrend.filter(d => d.revenue > 0).map(d => d.revenue), 0)) / (totalRevenue / revenueTrend.length || 1) * 100).toFixed(1) + '%'}
                icon={Target}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <ChartCard title="Revenue Trend" icon={TrendingUp}>
                <SimpleLineChart data={revenueTrend} dataKey="revenue" color="#10b981" />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              <ChartCard title="Revenue by Company" icon={BarChart3}>
                <SimpleChart
                  data={Object.values(companyStats)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8)
                    .map(c => ({
                      label: c.name.slice(0, 12),
                      displayValue: formatPeso(c.revenue),
                      value: c.revenue,
                    }))}
                  type="bar"
                />
              </ChartCard>
            </div>
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
                label="Avg Product Quantity/Sale"
                value={Math.floor(productAnalytics.reduce((sum, p) => sum + (p.quantity / p.transactions), 0) / productAnalytics.length)}
                icon={Package}
                color="orange"
              />
              <MetricCard
                label="Total Unique Products Sold"
                value={Math.floor(productAnalytics.length).toLocaleString()}
                icon={Zap}
                color="purple"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Top 10 Products by Revenue" icon={Package}>
                <SimpleChart
                  data={productAnalytics.slice(0, 10).map((p, idx) => ({
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

            {/* Detailed product table */}
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

        {/* COMPANY COMPARISON SECTION */}
        {activeSection === 'companies' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Revenue by Company" icon={TrendingUp}>
                <SimpleChart
                  data={Object.values(companyStats)
                    .sort((a, b) => b.revenue - a.revenue)
                    .map(c => ({
                      label: c.name.slice(0, 14),
                      displayValue: formatPeso(c.revenue),
                      value: c.revenue,
                    }))}
                  type="bar"
                />
              </ChartCard>
              <ChartCard title="Market Share Distribution" icon={BarChart3}>
                <SimplePieChart data={marketShareData} />
              </ChartCard>
            </div>

            {/* Company details table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Performance Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-gray-200 dark:border-gray-700">
                    <tr>
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
                      .map((c) => {
                        const totalRev = Object.values(companyStats).reduce((sum, x) => sum + x.revenue, 0);
                        return (
                          <tr key={c.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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

        {/* HOURLY ACTIVITY SECTION */}
        {activeSection === 'hourly' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <MetricCard
                label="Peak Hour"
                value={`${hourlyDist.reduce((max, h) => h.count > max.count ? h : max).hour}:00`}
                icon={Clock}
                color="blue"
              />
              <MetricCard
                label="Peak Hour Revenue"
                value={formatPeso(hourlyDist.reduce((max, h) => h.revenue > max.revenue ? h : max).revenue)}
                icon={TrendingUp}
                color="green"
              />
              <MetricCard
                label="Avg Transactions/Hour"
                value={Math.floor(filteredTransactions.length / 24)}
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

            <ChartCard title="Hourly Activity Heatmap" icon={Zap}>
              <HourlyHeatmapChart data={hourlyDist} />
            </ChartCard>
          </>
        )}

        {/* INSIGHTS SECTION */}
        {activeSection === 'insights' && (
          <>
            <InsightCard insights={insights} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <ChartCard title="User Distribution by Role" icon={Users}>
                <SimpleChart
                  data={[
                    {
                      label: 'Managers',
                      displayValue: Math.floor(filteredUsers.filter(u => u.role === 'manager').length),
                      value: Math.floor(filteredUsers.filter(u => u.role === 'manager').length),
                    },
                    {
                      label: 'Inventory Mgr',
                      displayValue: Math.floor(filteredUsers.filter(u => u.role === 'inventory_manager').length),
                      value: Math.floor(filteredUsers.filter(u => u.role === 'inventory_manager').length),
                    },
                    {
                      label: 'Cashiers',
                      displayValue: Math.floor(filteredUsers.filter(u => u.role === 'cashier').length),
                      value: Math.floor(filteredUsers.filter(u => u.role === 'cashier').length),
                    },
                  ]}
                  type="bar"
                />
              </ChartCard>

              <ChartCard title="Best Performing Companies" icon={Award}>
                <div className="space-y-3">
                  {Object.values(companyStats)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((c, idx) => (
                      <div key={c.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                            {idx + 1}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{c.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{formatPeso(c.revenue)}</span>
                      </div>
                    ))}
                </div>
              </ChartCard>
            </div>

            {/* Recent transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Recent Transactions
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredTransactions.slice(0, 10).map((t, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{t.company_name}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(t.createdAt)}</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatPeso(t.totalAmount || t.total || 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManagerAnalyticsDashboard;
