import { Link } from 'react-router';
import { MonitorSmartphone } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const HomePage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center relative">
      {/* Theme Toggle in upper right */}
      <div className="absolute top-6 right-8 z-20">
        <ThemeToggle />
      </div>

      {/* Main Content */}
      <div className="text-center px-4">
        {/* Logo/Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white dark:bg-gray-800 shadow-2xl mb-6">
          <MonitorSmartphone className="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" />
        </div>

        {/* Business Name */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          POS System
        </h1>
        
        {/* Tagline */}
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-12 max-w-md mx-auto">
          Your business management solution.
        </p>

        {/* Login Button */}
        <Link 
          to="/login" 
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default HomePage;
