import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  let title = "Switch to Light Mode";
  let Icon = Monitor;
  if (theme === 'system') {
    title = "System Mode (Cycle to Light)";
    Icon = Monitor;
  } else if (theme === 'light') {
    title = "Light Mode (Cycle to Dark)";
    Icon = Sun;
  } else if (theme === 'dark') {
    title = "Dark Mode (Cycle to System)";
    Icon = Moon;
  }

  return (
    <button
      onClick={cycleTheme}
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
