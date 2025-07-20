console.log('🎯 BACKEND DEBUG - PASO 6: Routes Setup');

try {
  // Setup completo previo
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const path = require('path');
  
  const database = require('./database');
  const users = database.users;
  const userDevices = database.userDevices;
  const deviceTypes = database.deviceTypes;
  const activeSessions = database.activeSessions;

  require('dotenv').config();
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://energiapp-tfb.onrender.com'] 
      : ['http://localhost:3000'],
    credentials: true
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('✅ Setup y middleware completados');

  console.log('🔧 Configurando rutas básicas...');
  
  // Ruta principal
  console.log('  - Configurando ruta principal...');
  app.get('/', (req, res) => {
    res.json({
      message: 'EnergiApp - API Test',
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });
  console.log('  ✅ Ruta principal configurada');
  
  // Ruta de health
  console.log('  - Configurando ruta health...');
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      version: 'debug-test',
      timestamp: new Date().toISOString()
    });
  });
  console.log('  ✅ Ruta health configurada');

  console.log('✅ ROUTES SETUP COMPLETADO');
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR EN ROUTES SETUP:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
