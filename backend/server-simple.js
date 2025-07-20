// Servidor backend simplificado para debugging
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

console.log('🎯 BACKEND SIMPLE - Iniciando...');

// Database import simple
const database = require('./database');
const users = database.users;
const userDevices = database.userDevices;
const deviceTypes = database.deviceTypes; 
const activeSessions = database.activeSessions;

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware básico
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://energiapp-tfb.onrender.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de autenticación simple
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !activeSessions[token]) {
    return res.status(401).json({ success: false, message: 'Token requerido' });
  }
  req.user = activeSessions[token];
  next();
};

// Rutas básicas
app.get('/', (req, res) => {
  res.json({
    message: 'EnergiApp - API Simplificada',
    version: '2.0.0-simplified',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    users: users.length,
    environment: process.env.NODE_ENV
  });
});

// Login básico
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password && u.active);
  
  if (!user) {
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
  
  const token = `token_${user.id}_${Date.now()}`;
  activeSessions[token] = user;
  
  res.json({
    success: true,
    token: token,
    user: { id: user.id, username: user.username, role: user.role }
  });
});

// Dispositivos básicos
app.get('/api/dispositivos', authenticate, (req, res) => {
  const devices = userDevices[req.user.id] || [];
  res.json({ success: true, devices, total: devices.length });
});

console.log('🚀 Iniciando servidor simplificado...');

// Server listen SIN todo el logging extra
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor iniciado en puerto ${PORT}`);
  console.log(`🌐 Health check: http://0.0.0.0:${PORT}/api/health`);
}).on('error', (error) => {
  console.error('❌ Error al iniciar servidor:', error);
  process.exit(1);
});

// Error handlers básicos
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Promesa rechazada:', reason);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

console.log('✅ Servidor simplificado configurado');
