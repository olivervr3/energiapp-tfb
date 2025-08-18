import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar localStorage primero
    const saved = localStorage.getItem('energiapp-theme');
    if (saved) {
      return saved === 'dark';
    }
    // Si no hay preferencia guardada, usar modo claro por defecto
    return false; // false = modo claro por defecto
  });

  useEffect(() => {
    // Guardar preferencia en localStorage
    localStorage.setItem('energiapp-theme', isDarkMode ? 'dark' : 'light');
    
    // Aplicar clase al body para CSS global
    document.body.classList.toggle('dark-theme', isDarkMode);
    document.body.classList.toggle('light-theme', !isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      // Colores modo oscuro
      primary: '#3b82f6',
      secondary: '#6366f1',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#06b6d4',
      
      // Backgrounds
      body: '#0f172a',
      surface: '#1e293b',
      card: '#334155',
      sidebar: '#1e293b',
      
      // Text
      text: '#f1f5f9',
      textSecondary: '#cbd5e1',
      textMuted: '#94a3b8',
      
      // Borders
      border: '#475569',
      borderLight: '#374151',
      
      // Inputs
      input: '#374151',
      inputBorder: '#6b7280',
      inputFocus: '#3b82f6',
      
      // Chart colors
      chart: {
        primary: '#3b82f6',
        secondary: '#10b981',
        tertiary: '#f59e0b',
        quaternary: '#ef4444',
        grid: '#374151',
        text: '#cbd5e1'
      }
    } : {
      // Colores modo claro
      primary: '#2563eb',
      secondary: '#7c3aed',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626',
      info: '#0891b2',
      
      // Backgrounds
      body: '#ffffff',
      surface: '#f8fafc',
      card: '#ffffff',
      sidebar: '#f1f5f9',
      
      // Text
      text: '#1e293b',
      textSecondary: '#475569',
      textMuted: '#64748b',
      
      // Borders
      border: '#e2e8f0',
      borderLight: '#f1f5f9',
      
      // Inputs
      input: '#ffffff',
      inputBorder: '#d1d5db',
      inputFocus: '#2563eb',
      
      // Chart colors
      chart: {
        primary: '#2563eb',
        secondary: '#059669',
        tertiary: '#d97706',
        quaternary: '#dc2626',
        grid: '#e5e7eb',
        text: '#374151'
      }
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
