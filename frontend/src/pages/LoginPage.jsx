import { useState } from 'react';
import { LogIn, MonitorSmartphone, Eye, EyeOff, CheckCircle2, PackageCheck, BarChart3 } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import axios from '../lib/axios';

const LoginPage = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [peekTimeout, setPeekTimeout] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Theme logic is now handled by ThemeToggle

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', { user_id: userId, password });
      const userData = response.data.data;
      login(userData);

      const rolePath = {
        admin: '/system-monitoring',
        manager: '/dashboard',
        inventory_manager: '/products',
        cashier: '/pos',
      };

      navigate(rolePath[userData.role] || '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 relative">
      {/* Theme Toggle in upper right */}
      <div className="absolute top-6 right-8 z-20">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side - Home Page Display */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-2xl mb-6">
              <MonitorSmartphone className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" />
            </div>
          </div>
          {/* Business Name */}
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            POS System
          </h1>
          {/* Tagline */}
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-sm mx-auto">
            Your business management solution.
          </p>
          {/* Features List */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Fast Checkout</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <PackageCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Inventory Management</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Advanced Reports</span>
            </div>
          </div>
        </div>
        {/* Right Side - Login Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2"> Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-400">Sign in to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User ID
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="CASHIER-00000-000"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-12"
                  required
                />
                {password && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-3 btn btn-ghost btn-xs p-1 text-gray-500 dark:text-gray-300"
                    onMouseDown={() => {
                      setShowPassword(true);
                      if (peekTimeout) clearTimeout(peekTimeout);
                      const timeout = setTimeout(() => setShowPassword(false), 3000);
                      setPeekTimeout(timeout);
                    }}
                    onMouseUp={() => {
                      setShowPassword(false);
                      if (peekTimeout) clearTimeout(peekTimeout);
                    }}
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Demo credentials (7 Eleven Jimenez):</p>
            <div className="text-xs text-gray-800 dark:text-gray-300 space-y-1">
              <div><span className="font-medium">Admin:</span> ADMIN-00000-000 / admin123</div>
              <div><span className="font-medium">Manager:</span> 7EJ-MGR-001 / manager123</div>
              <div><span className="font-medium">Inventory:</span> 7EJ-INV-001 / inventory123</div>
              <div><span className="font-medium">Cashier:</span> 7EJ-CSH-001 / cashier123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
