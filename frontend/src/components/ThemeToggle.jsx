import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';
  const title = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={title}
      title={title}
      type="button"
    >
      <Icon size={20} className="theme-toggle-icon" />
    </button>
  );
};

export default ThemeToggle;
