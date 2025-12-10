import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const ThemeToggle = ({ className = '' }) => {
  const [theme, setTheme] = useState('light');

  // Initialize theme from document element
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    setTheme(currentTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('pos-theme', newTheme);
  };

  return (
    <label className={`relative flex items-center w-10 h-[22px] cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={theme === 'dark'}
        onChange={toggleTheme}
        aria-label="Toggle theme"
        className="toggle toggle-md opacity-0 absolute"
      />
      <span
        className="absolute inset-0 rounded-full transition-colors"
        style={{
          backgroundColor: theme === 'dark' ? '#3a3f47' : '#d1d5db',
          border: `1px solid ${theme === 'dark' ? '#4a5563' : '#9ca3af'}`,
        }}
      ></span>
      <span className="absolute inset-0 pointer-events-none">
        <span
          className="absolute top-[2px] left-[2px] w-[18px] h-[18px] rounded-full flex items-center justify-center transition-transform duration-200 z-10"
          style={{
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f3f4f6',
            transform: theme === 'dark' ? 'translateX(18px)' : 'translateX(0)',
          }}
        >
          {theme === 'dark' ? (
            <Moon size={12} className="text-white" />
          ) : (
            <Sun size={12} className="text-gray-500" />
          )}
        </span>
      </span>
    </label>
  );
};

export default ThemeToggle;
