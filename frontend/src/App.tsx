import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Box } from '@mui/material';

import { useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import NotFound from './pages/NotFound';

// Lazy loading de componentes para mejor rendimiento
const Login = React.lazy(() => import('./pages/auth/Login'));
const Register = React.lazy(() => import('./pages/auth/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Dispositivos = React.lazy(() => import('./pages/Dispositivos'));
const Consumo = React.lazy(() => import('./pages/Consumo'));
const Predicciones = React.lazy(() => import('./pages/Predicciones'));
const Reportes = React.lazy(() => import('./pages/Reportes'));
const Configuracion = React.lazy(() => import('./pages/Configuracion'));
const Perfil = React.lazy(() => import('./pages/Perfil'));

// Componente para rutas protegidas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Componente para rutas públicas (solo accesibles sin autenticación)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>EnergiApp - Gestión Energética Doméstica</title>
        <meta 
          name="description" 
          content="Plataforma web para visualización y predicción del consumo energético doméstico mediante simulación IoT" 
        />
      </Helmet>
      
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Rutas públicas */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Rutas protegidas */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="dispositivos" element={<Dispositivos />} />
              <Route path="consumo" element={<Consumo />} />
              <Route path="predicciones" element={<Predicciones />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="configuracion" element={<Configuracion />} />
              <Route path="perfil" element={<Perfil />} />
            </Route>
            
            {/* Ruta 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Box>
    </>
  );
};

export default App;
