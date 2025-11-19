import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ThemeName } from '../types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  effectiveTheme: ThemeName; // The actual theme being applied
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'lingomingle_theme';

// Detect system theme preference (light or dark)
const getSystemPrefersDark = (): boolean => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  }
  return false;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeName) || 'auto';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Calculate effective theme (resolve 'auto' to actual theme)
  const effectiveTheme: ThemeName = theme === 'auto'
    ? (systemPrefersDark ? 'twilight' : 'meadow')
    : theme;

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    // Remove all theme classes
    root.classList.remove('theme-meadow', 'theme-daybreak', 'theme-twilight', 'theme-forest');
    // Add the effective theme class
    root.classList.add(`theme-${effectiveTheme}`);
  }, [effectiveTheme]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  }, []);

  const value = { theme, setTheme, effectiveTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
