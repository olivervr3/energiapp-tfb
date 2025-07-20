const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const { initializeDatabase } = require('./init-db');
require('dotenv').config({ path: '.env.production' });

// Importar la app del backend
const backendApp = require('./backend/src/app');

const app = express();
const PORT = process.env.PORT || 3001;

// Inicializar base de datos antes de configurar rutas
const startServer = async () => {
  try {
    // Inicializar base de datos con usuarios por defecto
    await initializeDatabase();
    
    // Middleware de seguridad para producción
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https:"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      }
    }));

    // CORS
    app.use(cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true
    }));

    // Servir archivos estáticos del frontend
    app.use(express.static(path.join(__dirname, 'frontend/build')));

    // Health check endpoint
    app.use('/', require('./health'));

    // API routes del backend
    app.use('/api', backendApp);

    // Servir la aplicación React para todas las rutas no-API
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
    });

    // Manejo de errores global
    app.use((err, req, res, next) => {
      console.error('Error global:', err);
      res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
          ? 'Error interno del servidor' 
          : err.message
      });
    });

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`EnergiApp TFB v2.0 ejecutándose en puerto ${PORT}`);
      console.log(`Dashboard: http://localhost:${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`Frontend: Integrado en la misma URL`);
      console.log(`Modo: ${process.env.NODE_ENV || 'development'}`);
      
      console.log('\nCredenciales de prueba:');
      console.log('   Usuario: test@test.com / Test123456');
      console.log('   Admin: admin@energiapp.com / Admin123456');
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();
