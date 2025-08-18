import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const LoginBackground = ({ children }) => {
  const { isDarkMode } = useTheme();

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundImage: `url(${process.env.PUBLIC_URL}/assets/images/backgrounds/Theme-background.jpg)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    position: 'relative'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    background: isDarkMode 
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.7) 100%)'
      : 'transparent' // Sin overlay en modo claro para ver la imagen
  };

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}></div>
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default LoginBackground;
