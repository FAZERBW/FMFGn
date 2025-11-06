import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import type { UIStyle } from '../types';

interface UIContextType {
  uiStyle: UIStyle;
  setUiStyle: (style: UIStyle) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uiStyle, setUiStyle] = useState<UIStyle>(() => {
    try {
      return (localStorage.getItem('uiStyle') as UIStyle) || 'classic';
    } catch {
      return 'classic';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('uiStyle', uiStyle);
    } catch (error) {
      console.error("Failed to save UI style to localStorage", error);
    }
    
    const root = document.documentElement;
    
    // Set data attribute for CSS styling
    root.setAttribute('data-ui-style', uiStyle);

  }, [uiStyle]);

  const value = useMemo(() => ({
    uiStyle,
    setUiStyle,
  }), [uiStyle]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};