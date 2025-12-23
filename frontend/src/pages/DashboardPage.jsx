import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { LayoutDashboard, Banknote, ShoppingBag, AlertTriangle, CheckCircle, MonitorSmartphone, Boxes, FileBarChart, Users } from 'lucide-react';
import Navbar from '../components/Navbar';
import axios from '../lib/axios';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    transactions: 0,
    lowStockItems: 0,
    activeProducts: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/transactions/dashboard');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-full mx-auto px-4 md:px-6 py-8">
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2"><LayoutDashboard size={28} className="inline mr-2" /> Welcome, Admin User!</h1>
          <p className="text-gray-600 dark:text-gray-400">Administrator Dashboard</p>
        </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Today's Sales</h3>
              <Banknote size={32} className="text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">₱{stats.todaySales.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Transactions</h3>
              <ShoppingBag size={32} className="text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.transactions}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Low Stock Items</h3>
              <AlertTriangle size={32} className="text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.lowStockItems}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Products</h3>
              <CheckCircle size={32} className="text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.activeProducts}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/pos" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <MonitorSmartphone size={32} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">POS Terminal</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Process sales and transactions</p>
              </div>
            </div>
          </Link>

          <Link to="/products" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <Boxes size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Products</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Manage inventory and products</p>
              </div>
            </div>
          </Link>

          <Link to="/users" className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg dark:hover:shadow-gray-600/50 transition-shadow p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users size={32} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Users</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Manage system users</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
