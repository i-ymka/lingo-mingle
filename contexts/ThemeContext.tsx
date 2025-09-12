import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { ThemeName } from '../types';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'lingomingle_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    return (localStorage.getItem(THEME_KEY) as ThemeName) || 'meadow';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('theme-meadow', 'theme-daybreak', 'theme-twilight', 'theme-forest');
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    localStorage.setItem(THEME_KEY, newTheme);
    setThemeState(newTheme);
  }, []);

  const value = { theme, setTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
