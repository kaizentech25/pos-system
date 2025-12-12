import { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import {
  Activity, AlertCircle, CheckCircle2, Database, Zap, Clock, Gauge, Server, AlertTriangle, TrendingUp
} from 'lucide-react';
import axios from '../lib/axios';
import {
  calculateSystemHealth, calculateAPIMetrics, calculateTransactionFailures, calculateErrorLogs,
  calculateDatabaseMetrics, calculateRequestSpikes, calculateRecentActivity, getServiceStatus,
  getHealthColor, getHealthBg
} from '../lib/adminUtils';

const AdminSystemMonitoring = () => {
  const [stats, setStats] = useState({ users: [], transactions: [] });
  const [loading, setLoading] = useState(true);
  const [systemHealth, setSystemHealth] = useState({
    status: 'checking',
    overallHealth: 0,
    uptime: 0,
    avgLatency: 0,
    errorRate: 0,
    activeConnections: 0,
    dbHealth: 'unknown',
    lastCheck: new Date().toISOString()
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-refresh health checks every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const [usersRes, transactionsRes] = await Promise.all([
        axios.get('/auth/users'),
        axios.get('/transactions'),
      ]);

      const users = usersRes.data.data || [];
      const transactions = transactionsRes.data.data || [];

      setStats({ users, transactions });

      // Calculate health metrics
      const health = calculateSystemHealth(transactions, users);
      setSystemHealth(health);
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      setSystemHealth(prev => ({
        ...prev,
        status: 'error',
        overallHealth: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const apiMetrics = useMemo(() => calculateAPIMetrics(stats.transactions), [stats.transactions]);
  const failures = useMemo(() => calculateTransactionFailures(stats.transactions), [stats.transactions]);
  const errors = useMemo(() => calculateErrorLogs(), []);
  const dbMetrics = useMemo(() => calculateDatabaseMetrics(), []);
  const spikes = useMemo(() => calculateRequestSpikes(), []);
  const activity = useMemo(() => calculateRecentActivity(stats.transactions, stats.users), [stats.transactions, stats.users]);
  const services = useMemo(() => getServiceStatus(), []);

  if (loading && systemHealth.status === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-full mx-auto px-4 md:px-6 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <Activity className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Loading system diagnostics...</p>
            </div>
          </div>
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
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">System Monitoring</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Technical diagnostics & performance metrics</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {autoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
              </button>
              <button
                onClick={() => fetchMonitoringData()}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
              >
                Refresh Now
              </button>
            </div>
          </div>
        </div>

        {/* Overall System Health */}
        <div className={`mb-8 p-6 rounded-lg border-2 ${
          systemHealth.status === 'healthy'
            ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20'
            : 'border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-900/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Overall System Health</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Weighted calculation: Transaction Success Rate (70%) + API Latency (20%) + Connection Health (10%)</p>
            </div>
            <div className="text-right">
              <p className={`text-3xl font-bold ${getHealthColor(systemHealth.overallHealth)}`}>
                {systemHealth.overallHealth}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Last check: {new Date(systemHealth.lastCheck).toLocaleTimeString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">API Latency</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.avgLatency}ms</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Error Rate</p>
              <p className={`text-2xl font-bold ${systemHealth.errorRate > 5 ? 'text-red-500' : 'text-green-500'}`}>
                {systemHealth.errorRate}%
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Active Connections</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemHealth.activeConnections}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Database Status</p>
              <p className={`text-2xl font-bold ${systemHealth.dbHealth === 'healthy' ? 'text-green-500' : 'text-yellow-500'}`}>
                {systemHealth.dbHealth}
              </p>
            </div>
          </div>
        </div>

        {/* API Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              API Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Requests (Last 1h)</span>
                <span className="font-bold text-gray-900 dark:text-white">{apiMetrics.requestsLast1h}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Requests (Last 24h)</span>
                <span className="font-bold text-gray-900 dark:text-white">{apiMetrics.requestsLast24h}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Avg Latency</span>
                <span className="font-bold text-gray-900 dark:text-white">{apiMetrics.avgLatency}ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">P99 Latency</span>
                <span className="font-bold text-gray-900 dark:text-white">{apiMetrics.p99Latency}ms</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Throughput</span>
                <span className="font-bold text-gray-900 dark:text-white">{apiMetrics.throughput} req/s</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-bold text-green-600">Operational</span>
              </div>
            </div>
          </div>

          {/* Database Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" />
              Database Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Status</span>
                <span className="font-bold text-green-600">{dbMetrics.status}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Response Time</span>
                <span className="font-bold text-gray-900 dark:text-white">{dbMetrics.responseTime}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Active Connections</span>
                <span className="font-bold text-gray-900 dark:text-white">{dbMetrics.connections}/{dbMetrics.maxConnections}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Query Count</span>
                <span className="font-bold text-gray-900 dark:text-white">{dbMetrics.queryCount}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Cache Hit Rate</span>
                <span className="font-bold text-gray-900 dark:text-white">{dbMetrics.cacheHitRate}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-600 dark:text-gray-400">Replication Lag</span>
                <span className="font-bold text-gray-900 dark:text-white">{dbMetrics.replicationLag}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-500" />
            Service Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(services).map(([service, data]) => (
              <div key={service} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {service.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-green-600">{data.status}</span> • {data.uptime}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Error Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Errors */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Error Logs (24h)
            </h3>
            <div className="text-3xl font-bold text-red-600 mb-4">{errors.totalErrors} errors</div>
            <div className="space-y-2">
              {errors.errorsByType.map((error) => (
                <div key={error.type} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-700 dark:text-gray-300">{error.type}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{error.count}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${
                      error.severity === 'high' ? 'bg-red-100 text-red-800' :
                      error.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {error.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {errors.critical > 0 && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                <p className="text-sm font-semibold text-red-800 dark:text-red-400">
                  ⚠️ {errors.critical} critical error(s) detected
                </p>
              </div>
            )}
          </div>

          {/* Transaction Failures */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Transaction Failures
            </h3>
            <div className="text-3xl font-bold text-orange-600 mb-2">{failures.totalFailures} failures</div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Failure rate: {failures.failureRate}%</p>
            <div className="space-y-2">
              {failures.allFailures.map((failure) => (
                <div key={failure.reason} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-700 dark:text-gray-300">{failure.reason}</span>
                  <span className="font-bold text-gray-900 dark:text-white">{failure.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Request Spikes */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            Hourly Request Distribution
          </h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 mb-4">
            {spikes.hourlyData.map((hour) => (
              <div key={hour.hour} className="text-center">
                <div
                  className={`w-full aspect-video rounded mb-1 transition-colors ${
                    hour.isSpiked
                      ? 'bg-red-400 hover:bg-red-500'
                      : 'bg-blue-400 hover:bg-blue-500'
                  }`}
                  title={`${hour.hour}: ${hour.requests} requests`}
                />
                <p className="text-xs text-gray-600 dark:text-gray-400">{hour.hour}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Avg: {spikes.avgRequests} req/h</span>
            <span>Peak: {spikes.maxRequests} req/h</span>
            <span>Spikes: {spikes.spikesDetected}</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">Last Transaction</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {activity.lastTransactionTime 
                  ? new Date(activity.lastTransactionTime).toLocaleTimeString() 
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">Transactions Today</span>
              <span className="font-bold text-gray-900 dark:text-white">{activity.transactionsToday}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">Active Users (24h)</span>
              <span className="font-bold text-gray-900 dark:text-white">{activity.usersActive24h}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-400">API Calls/Second</span>
              <span className="font-bold text-gray-900 dark:text-white">{activity.apiCallsPerSecond}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSystemMonitoring;
