import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label={isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
    >
      {isDarkMode ? (
        <FaSun style={{ color: '#f59e0b' }} />
      ) : (
        <FaMoon style={{ color: '#6366f1' }} />
      )}
    </button>
  );
};

export default ThemeToggle;
