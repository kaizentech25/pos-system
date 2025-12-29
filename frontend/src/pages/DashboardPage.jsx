import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, Banknote, ShoppingBag, AlertTriangle, CheckCircle, MonitorSmartphone, Boxes, FileBarChart, Users, Activity, TrendingUp, BarChart2, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todaySales: 0,
    transactions: 0,
    lowStockItems: 0,
    activeProducts: 0,
  });
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [loading, setLoading] = useState(true);

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isInventoryManager = role === 'inventory_manager';
  const isCashier = role === 'cashier';

  // Permissions
  const canViewSales = ['admin', 'manager', 'cashier'].includes(role);
  const canViewInventory = ['admin', 'manager', 'inventory_manager'].includes(role);
  const canViewUsers = role === 'admin';
  const canViewPOS = ['admin', 'cashier'].includes(role);
  const canViewAnalytics = ['admin', 'manager'].includes(role);
  const canViewMonitoring = role === 'admin';

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedCompany]);

  const fetchCompanies = async () => {
    if (!isAdmin) return;
    try {
      const response = await axios.get('/auth/users');
      const users = response.data.data || [];
      const nonAdminUsers = users.filter(u => u.role !== 'admin');
      const uniqueCompanies = [...new Set(nonAdminUsers.map(u => u.company_name).filter(Boolean))].sort();
      setCompanies(uniqueCompanies);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = {};
      
      // For non-admin users, always filter by their company
      if (!isAdmin && user?.company_name) {
        params.company_name = user.company_name;
      }
      
      // For admin, filter by selected company if not "all"
      if (isAdmin && selectedCompany !== 'all') {
        params.company_name = selectedCompany;
      }
      
      const response = await axios.get('/transactions/dashboard', { params });
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-full mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                <LayoutDashboard size={28} className="inline mr-2" /> Welcome, {user?.name}!
              </h1>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {role} Dashboard
                {!isAdmin && user?.company_name && ` - ${user.company_name}`}
              </p>
            </div>
            
            {/* Company Filter for Admin */}
            {isAdmin && (
              <div className="flex gap-3">
                <select
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium"
                >
                  <option value="all">All Companies</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                <button
                  onClick={fetchStats}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
                  disabled={loading}
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  Refresh
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards - Role-aware */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {canViewSales && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Today's Sales</h3>
                <Banknote size={32} className="text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-600">
                {loading ? '...' : `₱${stats.todaySales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            </div>
          )}

          {canViewSales && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Transactions</h3>
                <ShoppingBag size={32} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {loading ? '...' : stats.transactions}
              </p>
            </div>
          )}

          {canViewInventory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Low Stock Items</h3>
                <AlertTriangle size={32} className="text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {loading ? '...' : stats.lowStockItems}
              </p>
            </div>
          )}

          {canViewInventory && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Products</h3>
                <CheckCircle size={32} className="text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {loading ? '...' : stats.activeProducts}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions - Role-aware */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canViewPOS && (
            <Link to="/pos" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <MonitorSmartphone size={32} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">POS Terminal</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Process sales and transactions</p>
                </div>
              </div>
            </Link>
          )}

          {canViewInventory && (
            <Link to="/products" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Boxes size={32} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inventory</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Manage inventory and products</p>
                </div>
              </div>
            </Link>
          )}

          {canViewAnalytics && (
            <Link to="/analytics/market" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp size={32} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Market Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Platform-wide insights and trends</p>
                </div>
              </div>
            </Link>
          )}

          {canViewAnalytics && (
            <Link to="/analytics/company" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                  <BarChart2 size={32} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Company Analytics</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Company-specific performance data</p>
                </div>
              </div>
            </Link>
          )}

          {canViewUsers && (
            <Link to="/users" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Users size={32} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Users</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Manage system users</p>
                </div>
              </div>
            </Link>
          )}

          {canViewMonitoring && (
            <Link to="/system-monitoring" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                  <Activity size={32} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">System Monitoring</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Monitor system health and performance</p>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
