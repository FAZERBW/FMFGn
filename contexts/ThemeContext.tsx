import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { ColorTheme } from '../types';

interface ThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    try {
      return (localStorage.getItem('colorTheme') as ColorTheme) || 'solar';
    } catch {
      return 'solar';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('colorTheme', colorTheme);
    } catch (error) {
      console.error("Failed to save theme setting to localStorage", error);
    }
    
    const root = document.documentElement;
    
    // Clean up all possible theme classes
    const themeClasses = ['theme-solar', 'theme-lunar'];
    root.classList.remove(...themeClasses);

    root.classList.add(`theme-${colorTheme}`);

  }, [colorTheme]);

  const value = useMemo(() => ({
    colorTheme,
    setColorTheme,
  }), [colorTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};