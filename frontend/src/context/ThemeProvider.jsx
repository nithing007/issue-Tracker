import React, { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContext';

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState('light');

  const setTheme = (newTheme) => {
    if (newTheme === 'system' || newTheme === 'light' || newTheme === 'dark') {
      setThemeState(newTheme);
      localStorage.setItem('theme', newTheme);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      let activeTheme = 'light';
      if (theme === 'system') {
        activeTheme = mediaQuery.matches ? 'dark' : 'light';
      } else {
        activeTheme = theme;
      }
      setResolvedTheme(activeTheme);
      
      if (activeTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();

    const listener = (e) => {
      if (theme === 'system') {
        const activeTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(activeTheme);
        if (activeTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
