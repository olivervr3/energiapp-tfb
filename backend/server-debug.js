console.log('🎯 BACKEND DEBUG - PASO 5: Middleware Setup');

try {
  // Setup completo hasta Express app
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const { spawn } = require('child_process');
  const path = require('path');
  
  const database = require('./database');
  const users = database.users;
  const userDevices = database.userDevices;
  const deviceTypes = database.deviceTypes;
  const activeSessions = database.activeSessions;

  require('dotenv').config();
  const app = express();
  const PORT = process.env.PORT || 3001;
  console.log('✅ Setup básico completado');

  // IoT Simulator setup
  console.log('🔧 Configurando IoT Simulator...');
  let iotSimulator = null;
  let simulatorInitialized = false;
  
  const initializeIoTSimulator = () => {
    if (simulatorInitialized) return;
    try {
      const simulatorPath = path.join(__dirname, 'iot_simulator.py');
      console.log('IoT Simulator path:', simulatorPath);
      simulatorInitialized = true;
      console.log('IoT Simulator ready');
    } catch (error) {
      console.error('Failed to initialize IoT Simulator:', error);
    }
  };
  
  initializeIoTSimulator();
  console.log('✅ IoT Simulator configurado');

  console.log('🔧 Configurando middleware básico...');
  
  // Helmet
  console.log('  - Configurando Helmet...');
  app.use(helmet());
  console.log('  ✅ Helmet configurado');
  
  // CORS
  console.log('  - Configurando CORS...');
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://energiapp-tfb.onrender.com'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  }));
  console.log('  ✅ CORS configurado');
  
  // Body parsers
  console.log('  - Configurando body parsers...');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('  ✅ Body parsers configurados');

  console.log('✅ MIDDLEWARE SETUP COMPLETADO');
  process.exit(0);
} catch (error) {
  console.error('❌ ERROR EN MIDDLEWARE SETUP:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
console.log('📍 CWD inicial:', process.cwd());
console.log('📍 __dirname inicial:', __dirname);

try {
  console.log('🔧 Importando módulos básicos...');
  const express = require('express');
  const cors = require('cors');
  const helmet = require('helmet');
  const { spawn } = require('child_process');
  const path = require('path');
  console.log('✅ Módulos básicos importados');

  console.log('� Intentando importar base de datos...');
  console.log('📁 Verificando archivo database.js...');
  const fs = require('fs');
  const dbPath = path.join(__dirname, 'database.js');
  console.log('📍 Ruta database.js:', dbPath);
  console.log('📄 ¿Existe database.js?', fs.existsSync(dbPath));
  
  if (!fs.existsSync(dbPath)) {
    throw new Error('Archivo database.js no encontrado');
  }
  
  console.log('🔧 Importando database.js...');
  const database = require('./database');
  console.log('✅ Database.js importado correctamente');
  
  console.log('🔧 Extrayendo propiedades de database...');
  const users = database.users;
  const userDevices = database.userDevices;
  const deviceTypes = database.deviceTypes;
  const activeSessions = database.activeSessions;
  console.log('✅ Base de datos importada correctamente');
  console.log('📊 Usuarios cargados:', users ? users.length : 0);
  
  console.log('✅ DATABASE IMPORT COMPLETADO');
  process.exit(0); // SALIR AQUÍ PARA TEST
} catch (error) {
  console.error('❌ ERROR EN DATABASE IMPORT:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
