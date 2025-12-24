import { Link, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, MonitorSmartphone, Boxes, Users, FileBarChart, LogOut, Menu, X, Activity, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const role = user?.role;
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const canDashboard = ['admin', 'manager'].includes(role);
  const canPOS = ['admin', 'cashier'].includes(role);
  const canInventory = ['admin', 'manager', 'inventory_manager'].includes(role);
  const canUsers = role === 'admin';
  const canReports = ['admin', 'manager'].includes(role);
  const canMonitoring = role === 'admin';
  const canAnalytics = ['admin', 'manager'].includes(role);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => {
    return `px-3 py-2 rounded-lg font-medium transition-colors ${
      isActive(path)
        ? 'bg-blue-600 text-white'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
  };

  if (!user) return null;

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
            Kaizen Tech
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
              {/* System Monitoring - Admin only */}
              {canMonitoring && (
                <Link to="/system-monitoring" className={navLinkClass('/system-monitoring')}>
                  <Activity size={18} className="inline mr-1" /> System Monitoring
                </Link>
              )}
              {/* Users Management - Admin only */}
              {canUsers && (
                <Link to="/users" className={navLinkClass('/users')}>
                  <Users size={18} className="inline mr-1" /> Users
                </Link>
              )}
              {/* Admin: System Features Dropdown (grouped) */}
              {isAdmin && (
                <div className="relative group">
                  {(() => {
                    const featureTabs = [
                      { path: '/dashboard', label: 'Dashboard' },
                      { path: '/pos', label: 'POS Terminal' },
                      { path: '/products', label: 'Inventory' },
                      { path: '/analytics/market', label: 'Market Analytics' },
                      { path: '/analytics/company', label: 'Company Analytics' },
                    ];
                    const activeFeature = featureTabs.find(tab => isActive(tab.path) || location.pathname.startsWith('/analytics'));
                    const dropdownLabel = activeFeature ? activeFeature.label : 'Features';
                    return (
                      <button
                        className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${activeFeature ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        onMouseEnter={() => setSystemDropdownOpen(true)}
                        onMouseLeave={() => setSystemDropdownOpen(false)}
                      >
                        {dropdownLabel} <ChevronDown size={16} />
                      </button>
                    );
                  })()}
                  {systemDropdownOpen && (
                    <div
                      className="absolute left-0 mt-0 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg py-2 z-50"
                      onMouseEnter={() => setSystemDropdownOpen(true)}
                      onMouseLeave={() => setSystemDropdownOpen(false)}
                    >
                      <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <LayoutDashboard size={16} className="inline mr-2" /> Dashboard
                      </Link>
                      <Link to="/pos" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <MonitorSmartphone size={16} className="inline mr-2" /> POS Terminal
                      </Link>
                      <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <Boxes size={16} className="inline mr-2" /> Inventory
                      </Link>
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />
                      <Link to="/analytics/market" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <FileBarChart size={16} className="inline mr-2" /> Market Analytics
                      </Link>
                      <Link to="/analytics/company" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600">
                        <LayoutDashboard size={16} className="inline mr-2" /> Company Analytics
                      </Link>
                    </div>
                  )}
                </div>
              )}
              {/* Non-admin: Individual feature links (ordered) */}
              {!isAdmin && canDashboard && (
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <LayoutDashboard size={18} className="inline mr-1" /> Dashboard
                </Link>
              )}
              {!isAdmin && canPOS && (
                <Link to="/pos" className={navLinkClass('/pos')}>
                  <MonitorSmartphone size={18} className="inline mr-1" /> POS Terminal
                </Link>
              )}
              {!isAdmin && canInventory && (
                <Link to="/products" className={navLinkClass('/products')}>
                  <Boxes size={18} className="inline mr-1" /> Inventory
                </Link>
              )}
              {/* Market Analytics - Admin only */}
              {isAdmin && (
                <Link to="/analytics/market" className={navLinkClass('/analytics/market')}>
                  <FileBarChart size={18} className="inline mr-1" /> Market Analytics
                </Link>
              )}
              {/* Company Analytics - Admin and Manager */}
              {canAnalytics && (
                <Link to="/analytics/company" className={navLinkClass('/analytics/company')}>
                  <LayoutDashboard size={18} className="inline mr-1" /> Company Analytics
                </Link>
              )}
          </div>

          {/* Right side - Theme toggle, User info, Logout */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* User Info - Hidden on small screens */}
            <div className="hidden sm:block text-right">
              <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">({user.role})</div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex bg-red-600 dark:bg-red-700 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors items-center gap-2 flex-shrink-0"
            >
              <LogOut size={18} />
              <span className="hidden md:inline">Logout</span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">

              {/* Features in required order for all users (mobile) */}
              {canDashboard && (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass('/dashboard') + ' block'}>
                  <LayoutDashboard size={18} className="inline mr-1" /> Dashboard
                </Link>
              )}
              {canPOS && (
                <Link to="/pos" onClick={() => setMenuOpen(false)} className={navLinkClass('/pos') + ' block'}>
                  <MonitorSmartphone size={18} className="inline mr-1" /> POS Terminal
                </Link>
              )}
              {canInventory && (
                <Link to="/products" onClick={() => setMenuOpen(false)} className={navLinkClass('/products') + ' block'}>
                  <Boxes size={18} className="inline mr-1" /> Inventory
                </Link>
              )}
              {/* Market Analytics - Admin only */}
              {isAdmin && (
                <Link to="/analytics/market" onClick={() => setMenuOpen(false)} className={navLinkClass('/analytics/market') + ' block'}>
                  <FileBarChart size={18} className="inline mr-1" /> Market Analytics
                </Link>
              )}
              {/* Company Analytics - Admin and Manager */}
              {canAnalytics && (
                <Link to="/analytics/company" onClick={() => setMenuOpen(false)} className={navLinkClass('/analytics/company') + ' block'}>
                  <LayoutDashboard size={18} className="inline mr-1" /> Company Analytics
                </Link>
              )}
              {/* System Monitoring - Admin only */}
              {canMonitoring && (
                <Link to="/system-monitoring" onClick={() => setMenuOpen(false)} className={navLinkClass('/system-monitoring') + ' block'}>
                  <Activity size={18} className="inline mr-1" /> System Monitoring
                </Link>
              )}
              {/* Users Management - Admin only */}
              {canUsers && (
                <Link to="/users" onClick={() => setMenuOpen(false)} className={navLinkClass('/users') + ' block'}>
                  <Users size={18} className="inline mr-1" /> Users
                </Link>
              )}

            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2 mt-4"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar
