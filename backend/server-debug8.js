console.log('🎯 BACKEND DEBUG - PASO 8: Axios y dependencias completas');

try {
  // Setup básico
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const path = require('path');
  
  console.log('✅ Imports básicos completados');

  // Imports adicionales que usa el servidor completo
  console.log('🔧 Importando axios...');
  const axios = require('axios').default;
  console.log('✅ Axios importado');

  console.log('🔧 Importando otras dependencias...');
  // Simulemos las dependencias que usa el servidor completo
  const jsonwebtoken = require('jsonwebtoken');
  const bcryptjs = require('bcryptjs');
  console.log('✅ JWT y bcrypt importados');

  const database = require('./database');
  const users = database.users;
  const userDevices = database.userDevices;
  const deviceTypes = database.deviceTypes;
  const activeSessions = database.activeSessions;
  console.log('✅ Database importado');

  require('dotenv').config();
  const app = express();
  const PORT = process.env.PORT || 3001;
  console.log('✅ Setup completado');

  // Probar configuración de ML service (esto podría estar causando el problema)
  console.log('🔧 Configurando ML service...');
  const ML_SERVICE_URL = 'http://localhost:5001';
  
  // Middleware que verifica el servicio ML (esto podría estar colgándose)
  console.log('🔧 Creando checkMLService middleware...');
  const checkMLService = async (req, res, next) => {
    try {
      await axios.get(`${ML_SERVICE_URL}/`, { timeout: 5000 });
      next();
    } catch (error) {
      res.status(503).json({
        success: false,
        message: 'Servicio de Machine Learning no disponible'
      });
    }
  };
  console.log('✅ checkMLService middleware creado');

  console.log('✅ TODAS LAS DEPENDENCIAS IMPORTADAS CORRECTAMENTE');
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR EN DEPENDENCIAS COMPLETAS:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
