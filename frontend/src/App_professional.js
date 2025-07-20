import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';
import Dispositivos from './components/Dispositivos';
import Predicciones from './components/Predicciones';
import Recomendaciones from './components/Recomendaciones';
import Configuracion from './components/Configuracion';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import './App_new.css';

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'dispositivos', label: 'Dispositivos', icon: '🏠' },
    { id: 'predicciones', label: 'Predicciones', icon: '🔮' },
    { id: 'recomendaciones', label: 'Recomendaciones', icon: '💡' },
    { id: 'configuracion', label: 'Configuración', icon: '⚙️' }
  ];

  if (user?.role === 'admin') {
    navigation.push({ id: 'admin', label: 'Admin Panel', icon: '👑' });
  }

  if (!user) {
    return (
      <Router>
        <div className="app">
          <div className="auth-container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'dispositivos':
        return <Dispositivos />;
      case 'predicciones':
        return <Predicciones />;
      case 'recomendaciones':
        return <Recomendaciones />;
      case 'configuracion':
        return <Configuracion />;
      case 'admin':
        return user?.role === 'admin' ? <AdminPanel /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      {/* Header profesional */}
      <header className="header-professional">
        <div className="header-content">
          <div className="brand-section">
            <div className="brand-icon">⚡</div>
            <div className="brand-text">
              <h1 className="brand-title">EnergiApp v2.0</h1>
              <p className="brand-subtitle">Gestión Energética Inteligente</p>
            </div>
          </div>
          
          <nav className="nav-horizontal">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={`nav-button ${activeTab === item.id ? 'nav-button-active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="header-actions">
            <div className="user-info">
              <div className="user-avatar">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'Usuario'}</span>
                <span className="user-role">{user?.role === 'admin' ? 'Administrador' : 'Usuario'}</span>
              </div>
            </div>
            <button className="btn-secondary" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="mobile-nav">
            {navigation.map((item) => (
              <button
                key={item.id}
                className={`mobile-nav-item ${activeTab === item.id ? 'mobile-nav-item-active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
            <div className="mobile-nav-divider"></div>
            <button className="mobile-nav-item" onClick={handleLogout}>
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </header>

      {/* Main content area */}
      <main className="main-content">
        <div className="content-container">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="breadcrumb-home">🏠</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">
              {navigation.find(item => item.id === activeTab)?.label || 'Dashboard'}
            </span>
          </div>

          {/* Page title */}
          <div className="page-header">
            <h2 className="page-title">
              {navigation.find(item => item.id === activeTab)?.icon} {navigation.find(item => item.id === activeTab)?.label}
            </h2>
            <p className="page-description">
              {activeTab === 'dashboard' && 'Monitorización en tiempo real de tu consumo energético'}
              {activeTab === 'dispositivos' && 'Gestión y control de dispositivos conectados'}
              {activeTab === 'predicciones' && 'Predicciones inteligentes de consumo futuro'}
              {activeTab === 'recomendaciones' && 'Sugerencias personalizadas para optimizar tu consumo'}
              {activeTab === 'configuracion' && 'Ajustes de la aplicación y preferencias de usuario'}
              {activeTab === 'admin' && 'Panel de administración del sistema'}
            </p>
          </div>

          {/* Content area */}
          <div className="content-area">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-indicator status-online"></span>
          <span className="status-text">Sistema Online</span>
        </div>
        <div className="status-item">
          <span className="status-text">Última actualización: {new Date().toLocaleTimeString()}</span>
        </div>
        <div className="status-item">
          <span className="status-text">v2.0.1</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
