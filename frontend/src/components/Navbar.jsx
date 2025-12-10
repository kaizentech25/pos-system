import { Link, useNavigate, useLocation } from 'react-router';
import { LayoutDashboard, MonitorSmartphone, Boxes, Users, FileBarChart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
            POS System
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/dashboard" className={navLinkClass('/dashboard')}>
              <LayoutDashboard size={18} className="inline mr-1" /> Dashboard
            </Link>
            <Link to="/pos" className={navLinkClass('/pos')}>
              <MonitorSmartphone size={18} className="inline mr-1" /> POS Terminal
            </Link>
            <Link to="/products" className={navLinkClass('/products')}>
              <Boxes size={18} className="inline mr-1" /> Inventory
            </Link>
            {user.role === 'admin' && (
              <>
                <Link to="/users" className={navLinkClass('/users')}>
                  <Users size={18} className="inline mr-1" /> Users
                </Link>
                <Link to="/reports" className={navLinkClass('/reports')}>
                  <FileBarChart size={18} className="inline mr-1" /> Reports
                </Link>
              </>
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
            <Link to="/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass('/dashboard') + ' block'}>
              <LayoutDashboard size={18} className="inline mr-1" /> Dashboard
            </Link>
            <Link to="/pos" onClick={() => setMenuOpen(false)} className={navLinkClass('/pos') + ' block'}>
              <MonitorSmartphone size={18} className="inline mr-1" /> POS Terminal
            </Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className={navLinkClass('/products') + ' block'}>
              <Boxes size={18} className="inline mr-1" /> Inventory
            </Link>
            {user.role === 'admin' && (
              <>
                <Link to="/users" onClick={() => setMenuOpen(false)} className={navLinkClass('/users') + ' block'}>
                  <Users size={18} className="inline mr-1" /> Users
                </Link>
                <Link to="/reports" onClick={() => setMenuOpen(false)} className={navLinkClass('/reports') + ' block'}>
                  <FileBarChart size={18} className="inline mr-1" /> Reports
                </Link>
              </>
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
