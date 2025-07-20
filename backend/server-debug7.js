console.log('🎯 BACKEND DEBUG - PASO 7: Server Listen');

try {
  // Setup completo previo
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  
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
  app.use(cors());
  app.use(express.json());

  // Rutas básicas
  app.get('/', (req, res) => {
    res.json({ message: 'Test', status: 'OK' });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', version: 'debug' });
  });
  
  console.log('✅ Setup completado, iniciando servidor...');

  console.log('🔧 Intentando app.listen...');
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
    console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
    console.log('🎯 Server.listen() callback ejecutado');
    
    // Terminar después de 2 segundos para confirmar que funciona
    setTimeout(() => {
      console.log('✅ TEST COMPLETADO - Cerrando servidor');
      server.close();
      process.exit(0);
    }, 2000);
  });
  
  server.on('error', (error) => {
    console.error('❌ Error en server.listen:', error);
    process.exit(1);
  });
  
  console.log('🔧 Server.listen() llamado, esperando callback...');
  
} catch (error) {
  console.error('❌ ERROR EN SERVER LISTEN:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
