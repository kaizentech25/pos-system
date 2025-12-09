import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import axios from '../lib/axios';

const ReportsPage = () => {
  const [period, setPeriod] = useState('week');
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/transactions/reports', {
        params: { period },
      });
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  const dailySalesArray = Object.entries(reportData.dailySales).map(([date, sales]) => ({
    date,
    sales,
  }));

  const paymentMethodsArray = Object.entries(reportData.paymentMethods).map(([method, data]) => ({
    method,
    amount: data.amount,
    percentage: reportData.totalSales > 0 ? Math.round((data.amount / reportData.totalSales) * 100) : 0,
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Reports</h1>
            <p className="text-gray-600 dark:text-gray-400">Sales analytics and business insights</p>
          </div>
          <div className="flex gap-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
                <p className="text-2xl font-bold text-green-600">₱{reportData.totalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{reportData.transactions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Transaction</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">₱{reportData.avgTransaction.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Top Category</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{reportData.topCategory}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Daily Sales</h3>
            <div className="h-64 flex items-end gap-1 pb-4">
              {dailySalesArray.length > 0 ? (
                dailySalesArray.map((day, index) => {
                  const maxSales = Math.max(...dailySalesArray.map(d => d.sales), 1);
                  const height = (day.sales / maxSales) * 100;
                  const date = new Date(day.date);
                  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
                  const dayNum = date.getDate();
                  const monthNum = date.getMonth() + 1;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center h-full">
                      <div className="w-full bg-blue-600 dark:bg-blue-500 rounded-t hover:bg-blue-700 dark:hover:bg-blue-400 transition-all relative group flex-shrink-0" style={{ height: `${Math.max(height, 5)}%`, minHeight: '6px' }}>
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-200 text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 font-medium">
                          {day.date}<br />₱{day.sales.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold">{dayOfWeek}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">{monthNum}/{dayNum}</div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full flex items-center justify-center h-full text-gray-500 dark:text-gray-400">No data available</div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
            <div className="space-y-4">
              {paymentMethodsArray.map((method, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-gray-600 dark:bg-gray-400' : index === 1 ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}></div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">₱{method.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{method.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        index === 0 ? 'bg-gray-600 dark:bg-gray-400' : index === 1 ? 'bg-gray-400 dark:bg-gray-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Top Products by Revenue</h3>
          <div className="space-y-3">
            {reportData.topProducts.slice(0, 10).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} sold</p>
                  </div>
                </div>
                <p className="font-bold text-gray-900 dark:text-white">₱{product.revenue.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
