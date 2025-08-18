console.log('🎯 BACKEND SERVER INICIANDO - Línea 1');
console.log('📍 CWD inicial:', process.cwd());
console.log('📍 __dirname inicial:', __dirname);

const express = require('express');
console.log('✅ Express importado');

const cors = require('cors');
console.log('✅ CORS importado');

const helmet = require('helmet');
console.log('✅ Helmet importado');

const { spawn } = require('child_process');
console.log('✅ Child process importado');

const path = require('path');
console.log('✅ Path importado');

console.log('🔍 Intentando importar base de datos...');

// Importar base de datos SQLite persistente
let dbAPI;
try {
  console.log('📁 Verificando archivo database_sqlite.js...');
  const fs = require('fs');
  const dbPath = path.join(__dirname, 'database_sqlite.js');
  console.log('📍 Ruta database_sqlite.js:', dbPath);
  console.log('📄 ¿Existe database_sqlite.js?', fs.existsSync(dbPath));
  
  const database = require('./database_sqlite');
  console.log('✅ Database_sqlite.js importado correctamente');
  
  dbAPI = database.dbAPI;
  console.log('✅ Base de datos SQLite configurada correctamente');
} catch (error) {
  console.error('❌ Error al importar base de datos SQLite:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}

require('dotenv').config();
console.log('✅ Dotenv configurado');

// Verificar dependencias críticas
console.log('🔍 Verificando dependencias críticas...');
const criticalDeps = ['jsonwebtoken', 'bcryptjs', 'axios'];
for (const dep of criticalDeps) {
  try {
    require.resolve(dep);
    console.log(`✅ ${dep} disponible`);
  } catch (error) {
    console.error(`❌ ${dep} NO disponible:`, error.message);
  }
}

console.log('\n🚀 Iniciando backend EnergiApp...');
console.log('📋 Variables de entorno:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  PORT:', process.env.PORT);
console.log('  CWD:', process.cwd());
console.log('  __dirname:', __dirname);

console.log('🔧 Creando aplicación Express...');
const app = express();
console.log('✅ Aplicación Express creada');

const PORT = process.env.PORT || 3001;
console.log('✅ Puerto configurado:', PORT);

// Variables globales para el servidor
const activeSessions = {}; // Para almacenar sesiones activas

// Tipos de dispositivos
const deviceTypes = [
  { id: 'refrigerator', name: 'Refrigerador', icon: '🧊', typical_power: '100-200W' },
  { id: 'air_conditioning', name: 'Aire Acondicionado', icon: '❄️', typical_power: '1500-3000W' },
  { id: 'lighting', name: 'Iluminación', icon: '💡', typical_power: '10-100W' },
  { id: 'entertainment', name: 'Entretenimiento', icon: '📺', typical_power: '50-300W' },
  { id: 'kitchen', name: 'Electrodomésticos Cocina', icon: '🍳', typical_power: '500-2000W' },
  { id: 'heating', name: 'Calefacción', icon: '🔥', typical_power: '1000-3000W' },
  { id: 'washing', name: 'Lavado', icon: '👕', typical_power: '500-2500W' }
];

// IoT Simulator Integration
let iotSimulator = null;
let simulatorInitialized = false;

// Initialize IoT Simulator
const initializeIoTSimulator = () => {
  if (simulatorInitialized) return;
  
  try {
    const simulatorPath = path.join(__dirname, 'iot_simulator.py');
    console.log('Initializing IoT Simulator...');
    
    // Initialize Python simulator (we'll create a bridge function)
    simulatorInitialized = true;
    console.log('IoT Simulator ready');
  } catch (error) {
    console.error('Failed to initialize IoT Simulator:', error);
  }
};

// Bridge function to call Python IoT simulator
const callIoTSimulator = async (action, params = {}) => {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [
      path.join(__dirname, 'iot_simulator.py'),
      action,
      JSON.stringify(params)
    ]);
    
    let result = '';
    let error = '';
    
    python.stdout.on('data', (data) => {
      result += data.toString();
    });
    
    python.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    python.on('close', (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(result));
        } catch (e) {
          resolve({ success: true, data: result });
        }
      } else {
        reject(new Error(error || 'IoT Simulator failed'));
      }
    });
  });
};

// Initialize IoT Simulator at startup
try {
  initializeIoTSimulator();
  console.log('✅ IoT Simulator inicializado');
} catch (error) {
  console.log('⚠️  Error en IoT Simulator (continuando):', error.message);
}

console.log('🔧 Configurando middleware...');

// Middleware básico
try {
  app.use(helmet());
  console.log('✅ Helmet configurado');
} catch (error) {
  console.error('❌ Error configurando Helmet:', error.message);
}

try {
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, 'https://energiapp-tfb.onrender.com'] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002', 'http://127.0.0.1:3003'],
    credentials: true
  }));
  console.log('✅ CORS configurado');
} catch (error) {
  console.error('❌ Error configurando CORS:', error.message);
}

try {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  console.log('✅ Express parsers configurados');
} catch (error) {
  console.error('❌ Error configurando Express parsers:', error.message);
}

// Servir archivos estáticos del frontend en producción
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  console.log(`🔍 Verificando directorio frontend: ${frontendPath}`);
  
  const fs = require('fs');
  if (fs.existsSync(frontendPath)) {
    try {
      app.use(express.static(frontendPath));
      console.log(`✅ Archivos estáticos servidos desde: ${frontendPath}`);
    } catch (error) {
      console.log(`⚠️  Error sirviendo archivos estáticos: ${error.message}`);
    }
  } else {
    console.log(`⚠️  Directorio frontend no encontrado: ${frontendPath}`);
  }
}

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !activeSessions[token]) {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación requerido'
    });
  }
  
  req.user = activeSessions[token];
  next();
};

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado: Se requieren permisos de administrador'
    });
  }
  next();
};

// Logging middleware
app.use((req, res, next) => {
  const user = req.headers.authorization ? 
    `[${activeSessions[req.headers.authorization?.replace('Bearer ', '')]?.username || 'Anónimo'}]` : 
    '[Sin auth]';
  console.log(`${new Date().toISOString()} ${user} - ${req.method} ${req.path}`);
  next();
});

console.log('🛣️  Configurando rutas de la API...');

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Ruta principal con información de la API
app.get('/', (req, res) => {
  res.json({
    message: 'EnergiApp - API de Gestión Energética Multi-Usuario',
    version: '2.0.0',
    features: [
      'Sistema multi-usuario',
      'Gestión personalizada de dispositivos',
      'Panel de administración',
      'Autenticación JWT',
      'CRUD dispositivos'
    ],
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        register: 'POST /api/auth/register',
        profile: 'GET /api/auth/profile'
      },
      devices: {
        list: 'GET /api/dispositivos',
        create: 'POST /api/dispositivos',
        update: 'PUT /api/dispositivos/:id',
        delete: 'DELETE /api/dispositivos/:id',
        toggle: 'POST /api/dispositivos/:id/toggle'
      },
      admin: {
        users: 'GET /api/admin/users',
        stats: 'GET /api/admin/stats',
        devices: 'GET /api/admin/devices'
      }
    },
    demo_users: {
      admin: { username: 'admin', password: 'admin123' },
      user1: { username: 'usuario1', password: 'user123' },
      user2: { username: 'usuario2', password: 'user123' }
    }
  });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await dbAPI.getUserByUsername(username);
    
    if (!user || !(await dbAPI.verifyPassword(password, user.password)) || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }
    
    // Generar token simple (en producción sería JWT real)
    const token = `token_${user.id}_${Date.now()}`;
    activeSessions[token] = user;
    
    console.log(`Login exitoso: ${user.username} (${user.role})`);
    
    res.json({
      success: true,
      message: 'Login exitoso',
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Registro
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  
  // Validaciones básicas
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }
  
  try {
    // Verificar si el usuario ya existe
    const existingUser = await dbAPI.getUserByUsername(username);
    const existingEmail = await dbAPI.getUserByEmail(email);
    
    if (existingUser || existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'El usuario o email ya existe'
      });
    }
    
    // Crear nuevo usuario
    const newUser = await dbAPI.createUser({
      username,
      email,
      password,
      role: 'user',
      active: 1
    });
    
    console.log(`Nuevo usuario registrado: ${username}`);
    
    res.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Perfil del usuario actual
app.get('/api/auth/profile', authenticate, async (req, res) => {
  try {
    const userDevices = await dbAPI.getUserDevices(req.user.id);
    const activeDevices = userDevices.filter(d => d.status === 'active').length;
    
    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        created_at: req.user.created_at,
        stats: {
          total_devices: userDevices.length,
          active_devices: activeDevices,
          registered_days: Math.floor((new Date() - new Date(req.user.created_at)) / (1000 * 60 * 60 * 24))
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Logout
app.post('/api/auth/logout', authenticate, (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  delete activeSessions[token];
  
  console.log(`Logout: ${req.user.username}`);
  
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

// ==================== RUTAS DE DISPOSITIVOS POR USUARIO ====================

// Listar dispositivos del usuario actual
app.get('/api/dispositivos', authenticate, async (req, res) => {
  try {
    const devices = await dbAPI.getUserDevices(req.user.id);
    
    // Simular datos de consumo en tiempo real
    const devicesWithConsumption = devices.map(device => ({
      ...device,
      current_consumption: device.status === 'active' ? device.power + Math.random() * 50 : 0,
      daily_consumption: device.status === 'active' ? 
        ((device.power / 1000) * (16 + Math.random() * 8)).toFixed(2) : '0.00',
      last_reading: new Date().toISOString()
    }));
    
    res.json({
      success: true,
      devices: devicesWithConsumption,
      total: devicesWithConsumption.length,
      device_types: deviceTypes
    });
  } catch (error) {
    console.error('Error obteniendo dispositivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Crear nuevo dispositivo
app.post('/api/dispositivos', authenticate, async (req, res) => {
  const { name, type, location, power, efficiency, controllable } = req.body;
  
  if (!name || !type || !location || !power) {
    return res.status(400).json({
      success: false,
      message: 'Campos requeridos: name, type, location, power'
    });
  }
  
  try {
    const newDevice = await dbAPI.createDevice({
      name,
      type,
      location,
      power: parseInt(power),
      status: 'active',
      efficiency: efficiency || 'A',
      controllable: controllable !== false ? 1 : 0,
      user_id: req.user.id
    });
    
    console.log(`Nuevo dispositivo creado por ${req.user.username}: ${name}`);
    
    res.json({
      success: true,
      message: 'Dispositivo creado exitosamente',
      device: newDevice
    });
  } catch (error) {
    console.error('Error creando dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Actualizar dispositivo
app.put('/api/dispositivos/:id', authenticate, async (req, res) => {
  const deviceId = parseInt(req.params.id);
  
  try {
    const device = await dbAPI.getDeviceById(deviceId);
    
    if (!device || device.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo no encontrado'
      });
    }
    
    const { name, type, location, power, efficiency, controllable } = req.body;
    
    const updatedDevice = await dbAPI.updateDevice(deviceId, {
      name: name || device.name,
      type: type || device.type,
      location: location || device.location,
      power: power ? parseInt(power) : device.power,
      efficiency: efficiency || device.efficiency,
      controllable: controllable !== undefined ? (controllable ? 1 : 0) : device.controllable
    });
    
    console.log(`Dispositivo actualizado por ${req.user.username}: ${updatedDevice.name}`);
    
    res.json({
      success: true,
      message: 'Dispositivo actualizado exitosamente',
      device: updatedDevice
    });
  } catch (error) {
    console.error('Error actualizando dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Eliminar dispositivo
app.delete('/api/dispositivos/:id', authenticate, async (req, res) => {
  const deviceId = parseInt(req.params.id);
  
  try {
    const device = await dbAPI.getDeviceById(deviceId);
    
    if (!device || device.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo no encontrado'
      });
    }
    
    await dbAPI.deleteDevice(deviceId);
    
    console.log(`Dispositivo eliminado por ${req.user.username}: ${device.name}`);
    
    res.json({
      success: true,
      message: 'Dispositivo eliminado exitosamente',
      device: device
    });
  } catch (error) {
    console.error('Error eliminando dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Controlar dispositivo (encender/apagar)
app.post('/api/dispositivos/:id/toggle', authenticate, async (req, res) => {
  const deviceId = parseInt(req.params.id);
  const { action } = req.body;
  
  try {
    const device = await dbAPI.getDeviceById(deviceId);
    
    if (!device || device.user_id !== req.user.id) {
      return res.status(404).json({
        success: false,
        message: 'Dispositivo no encontrado'
      });
    }
    
    if (!device.controllable) {
      return res.status(400).json({
        success: false,
        message: 'Este dispositivo no se puede controlar remotamente'
      });
    }
    
    const newStatus = action === 'on' ? 'active' : 'inactive';
    const updatedDevice = await dbAPI.updateDevice(deviceId, { status: newStatus });
    
    console.log(`${req.user.username} ${newStatus === 'active' ? 'ENCENDIÓ' : 'APAGÓ'} ${device.name}`);
    
    res.json({
      success: true,
      message: `Dispositivo ${newStatus === 'active' ? 'encendido' : 'apagado'} correctamente`,
      device: updatedDevice
    });
  } catch (error) {
    console.error('Error controlando dispositivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ==================== RUTAS DE ADMINISTRACIÓN ====================

// Dashboard del administrador
app.get('/api/admin/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbAPI.getAllUsers();
    const totalUsers = allUsers.filter(u => u.active).length;
    
    const allDevices = await dbAPI.getAllDevices();
    const totalDevices = allDevices.length;
    const activeDevices = allDevices.filter(d => d.status === 'active').length;
    const totalConsumption = allDevices
      .filter(d => d.status === 'active')
      .reduce((sum, device) => sum + device.power, 0);
    
    res.json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_devices: totalDevices,
        active_devices: activeDevices,
        total_consumption_watts: totalConsumption,
        total_consumption_kwh: (totalConsumption / 1000).toFixed(2),
        device_types_usage: deviceTypes.map(type => ({
          type: type.name,
          count: allDevices.filter(d => d.type === type.id).length
        }))
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Gestión de usuarios (solo admin)
app.get('/api/admin/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const allUsers = await dbAPI.getAllUsers();
    
    const usersWithStats = await Promise.all(allUsers.map(async (user) => {
      const userDevices = await dbAPI.getUserDevices(user.id);
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        active: user.active,
        device_count: userDevices.length,
        active_devices: userDevices.filter(d => d.status === 'active').length
      };
    }));
    
    res.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length
    });
  } catch (error) {
    console.error('Error obteniendo usuarios admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// Todos los dispositivos (solo admin)
app.get('/api/admin/devices', authenticate, requireAdmin, async (req, res) => {
  try {
    const allDevices = await dbAPI.getAllDevices();
    const allUsers = await dbAPI.getAllUsers();
    
    const devicesWithOwner = allDevices.map(device => {
      const user = allUsers.find(u => u.id === device.user_id);
      return {
        ...device,
        owner: user ? user.username : 'Usuario eliminado'
      };
    });
    
    res.json({
      success: true,
      devices: devicesWithOwner,
      total: devicesWithOwner.length
    });
  } catch (error) {
    console.error('Error obteniendo dispositivos admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ==================== DASHBOARD PÚBLICO (PARA DEMOSTRACIÓN) ====================

app.get('/api/dashboard', authenticate, async (req, res) => {
  try {
    // Dashboard básico con datos del usuario autenticado
    const userId = req.user.id;
    const userDevicesArray = await dbAPI.getUserDevices(userId);
    const activeDevices = userDevicesArray.filter(d => d.status === 'active');
    const totalActiveDevices = activeDevices.length;
    const totalConsumption = activeDevices.reduce((sum, device) => sum + (device.power || 0), 0);
    
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      current: {
        consumption: (totalConsumption / 1000).toFixed(2),
        cost_per_hour: ((totalConsumption / 1000) * 0.15).toFixed(3),
        status: totalConsumption > 3000 ? 'high' : totalConsumption > 1500 ? 'normal' : 'low',
        active_devices: totalActiveDevices
      },
      today: {
        consumption: ((totalConsumption / 1000) * (18 + Math.random() * 6)).toFixed(2),
        cost: ((totalConsumption / 1000) * (18 + Math.random() * 6) * 0.15).toFixed(2),
        vs_yesterday: `${(Math.random() * 20 - 10).toFixed(1)}%`
      },
      recommendations: [
        {
          id: 1,
          message: `Tienes ${totalActiveDevices} dispositivos activos. Considera apagar los que no uses.`,
          potential_saving: `€${((totalConsumption / 1000) * 0.15 * 0.2).toFixed(2)}/día`
        }
      ]
    });
  } catch (error) {
    console.error('Error obteniendo dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ==================== RUTAS DE ADMINISTRACIÓN AVANZADAS ====================

// Eliminar usuario (solo admin)
app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
  
  if (users[userIndex].role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No se puede eliminar a un administrador'
    });
  }
  
  users.splice(userIndex, 1);
  delete userDevices[userId];
  
  res.json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  });
});

// Activar/Desactivar usuario (solo admin)
app.post('/api/admin/users/:id/:action', authenticate, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const action = req.params.action;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
  
  if (user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No se puede modificar a un administrador'
    });
  }
  
  user.active = action === 'activate';
  
  res.json({
    success: true,
    message: `Usuario ${action === 'activate' ? 'activado' : 'desactivado'} exitosamente`
  });
});

// Crear usuario (solo admin)
app.post('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }
  
  if (users.find(u => u.username === username)) {
    return res.status(409).json({
      success: false,
      message: 'El nombre de usuario ya existe'
    });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      message: 'El email ya está registrado'
    });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    email,
    password,
    role: role || 'user',
    created_at: new Date().toISOString(),
    active: true
  };
  
  users.push(newUser);
  userDevices[newUser.id] = [];
  
  res.json({
    success: true,
    message: 'Usuario creado exitosamente',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Eliminar dispositivo (solo admin)
app.delete('/api/admin/devices/:id', authenticate, requireAdmin, (req, res) => {
  const deviceId = parseInt(req.params.id);
  let deviceFound = false;
  
  Object.keys(userDevices).forEach(userId => {
    const deviceIndex = userDevices[userId].findIndex(d => d.id === deviceId);
    if (deviceIndex !== -1) {
      userDevices[userId].splice(deviceIndex, 1);
      deviceFound = true;
    }
  });
  
  if (!deviceFound) {
    return res.status(404).json({
      success: false,
      message: 'Dispositivo no encontrado'
    });
  }
  
  res.json({
    success: true,
    message: 'Dispositivo eliminado exitosamente'
  });
});

// Cambiar estado de dispositivo (solo admin)
app.post('/api/admin/devices/:id/:action', authenticate, requireAdmin, (req, res) => {
  const deviceId = parseInt(req.params.id);
  const action = req.params.action;
  let deviceFound = false;
  
  Object.keys(userDevices).forEach(userId => {
    const device = userDevices[userId].find(d => d.id === deviceId);
    if (device) {
      device.status = action === 'activate' ? 'active' : 'inactive';
      deviceFound = true;
    }
  });
  
  if (!deviceFound) {
    return res.status(404).json({
      success: false,
      message: 'Dispositivo no encontrado'
    });
  }
  
  res.json({
    success: true,
    message: `Dispositivo ${action === 'activate' ? 'activado' : 'desactivado'} exitosamente`
  });
});

// Logs del sistema (solo admin)
app.get('/api/admin/logs', authenticate, requireAdmin, (req, res) => {
  // Simulando logs del sistema
  const logs = [
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'info',
      message: 'Usuario admin inició sesión'
    },
    {
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      level: 'warning',
      message: 'Intento de acceso fallido para usuario inexistente'
    },
    {
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      level: 'info',
      message: 'Nuevo dispositivo registrado por usuario1'
    },
    {
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      level: 'error',
      message: 'Error de conexión con base de datos (simulado)'
    },
    {
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      level: 'info',
      message: 'Sistema iniciado correctamente'
    }
  ];
  
  res.json({
    success: true,
    logs: logs.reverse()
  });
});

// Reportes de energía (solo admin)
app.get('/api/admin/energy-reports', authenticate, requireAdmin, (req, res) => {
  const userConsumption = users
    .filter(u => u.role === 'user')
    .map(user => ({
      username: user.username,
      consumption: Math.round((Math.random() * 50 + 10) * 100) / 100
    }));
    
  const topConsumingDevices = [];
  Object.entries(userDevices).forEach(([userId, devices]) => {
    const user = users.find(u => u.id === parseInt(userId));
    devices.forEach(device => {
      topConsumingDevices.push({
        name: `${device.name} (${user.username})`,
        consumption: Math.round((device.power * 0.024) * 100) / 100
      });
    });
  });
  
  topConsumingDevices.sort((a, b) => b.consumption - a.consumption);
  
  res.json({
    success: true,
    reports: {
      user_consumption: userConsumption,
      top_consuming_devices: topConsumingDevices.slice(0, 5)
    }
  });
});

// ==================== RUTAS DE SALUD Y ESTADO ====================

// ==================== RUTAS DE ADMINISTRACIÓN AVANZADAS ====================

// Eliminar usuario (solo admin)
app.delete('/api/admin/users/:id', authenticate, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
  
  if (users[userIndex].role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No se puede eliminar a un administrador'
    });
  }
  
  users.splice(userIndex, 1);
  delete userDevices[userId];
  
  res.json({
    success: true,
    message: 'Usuario eliminado exitosamente'
  });
});

// Activar/Desactivar usuario (solo admin)
app.post('/api/admin/users/:id/:action', authenticate, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.id);
  const action = req.params.action;
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Usuario no encontrado'
    });
  }
  
  if (user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'No se puede modificar a un administrador'
    });
  }
  
  user.active = action === 'activate';
  
  res.json({
    success: true,
    message: `Usuario ${action === 'activate' ? 'activado' : 'desactivado'} exitosamente`
  });
});

// Crear usuario (solo admin)
app.post('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  const { username, email, password, role } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Todos los campos son requeridos'
    });
  }
  
  if (users.find(u => u.username === username)) {
    return res.status(409).json({
      success: false,
      message: 'El nombre de usuario ya existe'
    });
  }
  
  if (users.find(u => u.email === email)) {
    return res.status(409).json({
      success: false,
      message: 'El email ya está registrado'
    });
  }
  
  const newUser = {
    id: Math.max(...users.map(u => u.id)) + 1,
    username,
    email,
    password,
    role: role || 'user',
    created_at: new Date().toISOString(),
    active: true
  };
  
  users.push(newUser);
  userDevices[newUser.id] = [];
  
  res.json({
    success: true,
    message: 'Usuario creado exitosamente',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Eliminar dispositivo (solo admin)
app.delete('/api/admin/devices/:id', authenticate, requireAdmin, (req, res) => {
  const deviceId = parseInt(req.params.id);
  let deviceFound = false;
  
  Object.keys(userDevices).forEach(userId => {
    const deviceIndex = userDevices[userId].findIndex(d => d.id === deviceId);
    if (deviceIndex !== -1) {
      userDevices[userId].splice(deviceIndex, 1);
      deviceFound = true;
    }
  });
  
  if (!deviceFound) {
    return res.status(404).json({
      success: false,
      message: 'Dispositivo no encontrado'
    });
  }
  
  res.json({
    success: true,
    message: 'Dispositivo eliminado exitosamente'
  });
});

// Cambiar estado de dispositivo (solo admin)
app.post('/api/admin/devices/:id/:action', authenticate, requireAdmin, (req, res) => {
  const deviceId = parseInt(req.params.id);
  const action = req.params.action;
  let deviceFound = false;
  
  Object.keys(userDevices).forEach(userId => {
    const device = userDevices[userId].find(d => d.id === deviceId);
    if (device) {
      device.status = action === 'activate' ? 'active' : 'inactive';
      deviceFound = true;
    }
  });
  
  if (!deviceFound) {
    return res.status(404).json({
      success: false,
      message: 'Dispositivo no encontrado'
    });
  }
  
  res.json({
    success: true,
    message: `Dispositivo ${action === 'activate' ? 'activado' : 'desactivado'} exitosamente`
  });
});

// Logs del sistema (solo admin)
app.get('/api/admin/logs', authenticate, requireAdmin, (req, res) => {
  // Simulando logs del sistema
  const logs = [
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'info',
      message: 'Usuario admin inició sesión'
    },
    {
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      level: 'warning',
      message: 'Intento de acceso fallido para usuario inexistente'
    },
    {
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      level: 'info',
      message: 'Nuevo dispositivo registrado por usuario1'
    },
    {
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      level: 'error',
      message: 'Error de conexión con base de datos (simulado)'
    },
    {
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      level: 'info',
      message: 'Sistema iniciado correctamente'
    }
  ];
  
  res.json({
    success: true,
    logs: logs.reverse()
  });
});

// Reportes de energía (solo admin)
app.get('/api/admin/energy-reports', authenticate, requireAdmin, (req, res) => {
  const userConsumption = users
    .filter(u => u.role === 'user')
    .map(user => ({
      username: user.username,
      consumption: Math.round((Math.random() * 50 + 10) * 100) / 100
    }));
    
  const topConsumingDevices = [];
  Object.entries(userDevices).forEach(([userId, devices]) => {
    const user = users.find(u => u.id === parseInt(userId));
    devices.forEach(device => {
      topConsumingDevices.push({
        name: `${device.name} (${user.username})`,
        consumption: Math.round((device.power * 0.024) * 100) / 100
      });
    });
  });
  
  topConsumingDevices.sort((a, b) => b.consumption - a.consumption);
  
  res.json({
    success: true,
    reports: {
      user_consumption: userConsumption,
      top_consuming_devices: topConsumingDevices.slice(0, 5)
    }
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const stats = await dbAPI.getAdminStats();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      active_sessions: Object.keys(activeSessions).length,
      total_users: stats.total_users,
      total_devices: stats.total_devices,
      active_devices: stats.active_devices
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed'
    });
  }
});

// ==================== RUTAS DE MACHINE LEARNING ====================

// Importar librerías para llamadas HTTP
const axios = require('axios').default;

// Configuración del servicio ML
const ML_SERVICE_URL = 'http://localhost:5001';

// Middleware para verificar que el servicio ML está disponible
const checkMLService = async (req, res, next) => {
  try {
    await axios.get(`${ML_SERVICE_URL}/`, { timeout: 5000 });
    next();
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Servicio de Machine Learning no disponible',
      error: 'ML_SERVICE_UNAVAILABLE'
    });
  }
};

// Obtener predicción de consumo para un usuario
app.post('/api/predict/consumption', authenticate, checkMLService, async (req, res) => {
  try {
    const userId = req.user.id;
    const { hours_ahead = 24, device_type = 'aggregate' } = req.body;
    
    // Obtener dispositivos del usuario para contexto
    const userDevicesArray = userDevices[userId] || [];
    const activeDevices = userDevicesArray.filter(d => d.status === 'active');
    
    // Parámetros base para la predicción
    const predictionData = {
      user_id: userId,
      hours_ahead: Math.min(hours_ahead, 168), // Máximo 1 semana
      device_type,
      temperature: req.body.temperature || 20.0,
      humidity: req.body.humidity || 60.0,
      occupancy: req.body.occupancy || 2,
      house_size: req.body.house_size || 100,
      active_devices_count: activeDevices.length,
      total_device_power: activeDevices.reduce((sum, device) => sum + (device.power || 0), 0)
    };
    
    // Llamada al servicio ML
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/consumption`, predictionData, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    // Procesar y enriquecer la respuesta
    const predictions = mlResponse.data.predictions.map(pred => ({
      ...pred,
      cost: (pred.predicted_consumption * 0.15 / 1000).toFixed(4), // €/kWh
      efficiency_rating: pred.predicted_consumption < 500 ? 'A' : 
                        pred.predicted_consumption < 1000 ? 'B' : 
                        pred.predicted_consumption < 1500 ? 'C' : 'D'
    }));
    
    res.json({
      success: true,
      user_id: userId,
      device_type,
      predictions,
      summary: {
        total_consumption_24h: predictions.slice(0, 24).reduce((sum, p) => sum + p.predicted_consumption, 0),
        estimated_cost_24h: predictions.slice(0, 24).reduce((sum, p) => sum + parseFloat(p.cost), 0).toFixed(2),
        peak_hour: predictions.reduce((max, p) => p.predicted_consumption > max.predicted_consumption ? p : max),
        model_info: mlResponse.data.model_type
      }
    });
    
  } catch (error) {
    console.error('Error en predicción ML:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo predicción de consumo',
      error: error.response?.data || error.message
    });
  }
});

// Obtener predicción para un electrodoméstico específico
app.post('/api/predict/appliance/:appliance', authenticate, checkMLService, async (req, res) => {
  try {
    const { appliance } = req.params;
    const userId = req.user.id;
    
    // Validar electrodoméstico
    const validAppliances = ['fridge', 'washing_machine', 'dishwasher', 'kettle', 'microwave', 'toaster', 'television', 'lighting'];
    if (!validAppliances.includes(appliance)) {
      return res.status(400).json({
        success: false,
        message: `Electrodoméstico '${appliance}' no válido`,
        valid_appliances: validAppliances
      });
    }
    
    // Datos para la predicción
    const predictionData = {
      temperature: req.body.temperature || 20.0,
      humidity: req.body.humidity || 60.0,
      occupancy: req.body.occupancy || 2
    };
    
    // Llamada al servicio ML
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict/appliance/${appliance}`, predictionData, {
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    const prediction = mlResponse.data;
    
    res.json({
      success: true,
      user_id: userId,
      appliance,
      predicted_consumption: prediction.predicted_consumption,
      estimated_cost_hour: ((prediction.predicted_consumption * 0.15) / 1000).toFixed(4),
      timestamp: prediction.timestamp,
      model_type: prediction.model_type
    });
    
  } catch (error) {
    console.error('Error en predicción de electrodoméstico:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo predicción de electrodoméstico',
      error: error.response?.data || error.message
    });
  }
});

// Análisis avanzado de patrones de consumo
app.post('/api/analyze/consumption', authenticate, checkMLService, async (req, res) => {
  try {
    const userId = req.user.id;
    const { consumption_data } = req.body;
    
    if (!consumption_data || !Array.isArray(consumption_data)) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren datos de consumo en formato array'
      });
    }
    
    // Llamada al servicio ML para análisis
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/analyze/consumption`, {
      consumption_data
    }, {
      timeout: 20000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json({
      success: true,
      user_id: userId,
      analysis: mlResponse.data.analysis,
      analyzed_samples: mlResponse.data.analyzed_samples,
      generated_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en análisis de consumo:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error analizando patrones de consumo',
      error: error.response?.data || error.message
    });
  }
});

// Obtener recomendaciones de eficiencia energética
app.post('/api/recommendations', authenticate, checkMLService, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Calcular consumo actual del usuario
    const userDevicesArray = userDevices[userId] || [];
    const activeDevices = userDevicesArray.filter(d => d.status === 'active');
    const currentConsumption = activeDevices.reduce((sum, device) => sum + (device.power || 0), 0);
    
    // Datos para recomendaciones
    const recommendationData = {
      current_consumption: currentConsumption,
      user_type: 'residential',
      house_size: req.body.house_size || 100,
      occupancy: req.body.occupancy || 2,
      active_devices: activeDevices.length
    };
    
    // Llamada al servicio ML
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/recommendations`, recommendationData, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
    
    res.json({
      success: true,
      user_id: userId,
      recommendations: mlResponse.data.recommendations,
      current_metrics: mlResponse.data.current_metrics,
      devices_context: {
        active_devices: activeDevices.length,
        total_power: currentConsumption,
        device_breakdown: activeDevices.map(d => ({
          name: d.name,
          type: d.type,
          power: d.power
        }))
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo recomendaciones:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo recomendaciones',
      error: error.response?.data || error.message
    });
  }
});

// Estado del servicio ML
app.get('/api/ml/status', authenticate, async (req, res) => {
  try {
    const mlResponse = await axios.get(`${ML_SERVICE_URL}/models/status`, {
      timeout: 5000
    });
    
    res.json({
      success: true,
      ml_service: mlResponse.data,
      integration_status: 'connected',
      last_check: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Servicio ML no disponible',
      integration_status: 'disconnected',
      error: error.message
    });
  }
});

// Dashboard mejorado con ML
app.get('/api/dashboard/enhanced', authenticate, checkMLService, async (req, res) => {
  try {
    const userId = req.user.id;
    const userDevicesArray = userDevices[userId] || [];
    const activeDevices = userDevicesArray.filter(d => d.status === 'active');
    const currentConsumption = activeDevices.reduce((sum, device) => sum + (device.power || 0), 0);
    
    // Obtener predicción para las próximas 24 horas
    const predictionResponse = await axios.post(`${ML_SERVICE_URL}/predict/consumption`, {
      user_id: userId,
      hours_ahead: 24,
      device_type: 'aggregate',
      temperature: 20.0,
      humidity: 60.0,
      occupancy: 2
    }, { timeout: 10000 });
    
    // Obtener recomendaciones
    const recommendationsResponse = await axios.post(`${ML_SERVICE_URL}/recommendations`, {
      current_consumption: currentConsumption,
      house_size: 100,
      occupancy: 2
    }, { timeout: 10000 });
    
    const predictions = predictionResponse.data.predictions;
    const nextHourPrediction = predictions[0];
    const total24h = predictions.reduce((sum, p) => sum + p.predicted_consumption, 0);
    
    res.json({
      success: true,
      user_id: userId,
      current: {
        consumption: (currentConsumption / 1000).toFixed(2),
        cost_per_hour: ((currentConsumption / 1000) * 0.15).toFixed(3),
        status: currentConsumption > 3000 ? 'high' : currentConsumption > 1500 ? 'normal' : 'low',
        active_devices: activeDevices.length
      },
      predictions: {
        next_hour: {
          consumption: (nextHourPrediction.predicted_consumption / 1000).toFixed(2),
          cost: ((nextHourPrediction.predicted_consumption / 1000) * 0.15).toFixed(3)
        },
        next_24h: {
          total_consumption: (total24h / 1000).toFixed(2),
          estimated_cost: ((total24h / 1000) * 0.15).toFixed(2),
          peak_hour: predictions.reduce((max, p) => p.predicted_consumption > max.predicted_consumption ? p : max).hour
        }
      },
      recommendations: recommendationsResponse.data.recommendations.slice(0, 3),
      ml_powered: true,
      model_info: predictionResponse.data.model_type
    });
    
  } catch (error) {
    console.error('Error en dashboard mejorado:', error.message);
    // Fallback al dashboard básico
    res.redirect('/api/dashboard');
  }
});

// ==================== FIN RUTAS ML ====================

// ==================== RUTAS IOT SIMULATOR ====================

// Obtener estado del simulador IoT
app.get('/api/iot/status', authenticate, async (req, res) => {
  try {
    const status = await callIoTSimulator('get_status', {});
    res.json({
      success: true,
      iot_status: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estado IoT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estado del simulador IoT',
      error: error.message
    });
  }
});

// Obtener consumo actual de todos los dispositivos
app.get('/api/iot/current-consumption', authenticate, async (req, res) => {
  try {
    const consumption = await callIoTSimulator('get_current_consumption', {});
    res.json({
      success: true,
      devices: consumption.devices,
      total_power: consumption.total_power,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo consumo IoT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo consumo actual',
      error: error.message
    });
  }
});

// Generar datos simulados para un período
app.post('/api/iot/generate-data', authenticate, async (req, res) => {
  try {
    const { start_time, duration_hours = 24, interval_minutes = 10 } = req.body;
    
    const data = await callIoTSimulator('generate_time_series', {
      start_time: start_time || new Date().toISOString(),
      duration_hours,
      interval_minutes
    });
    
    res.json({
      success: true,
      generated_data: data,
      duration_hours,
      data_points: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generando datos IoT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generando datos simulados',
      error: error.message
    });
  }
});

// Controlar dispositivo específico
app.post('/api/iot/control-device', authenticate, async (req, res) => {
  try {
    const { device_name, action, parameters = {} } = req.body;
    
    if (!device_name || !action) {
      return res.status(400).json({
        success: false,
        message: 'device_name y action son requeridos'
      });
    }
    
    const result = await callIoTSimulator('control_device', {
      device_name,
      action,
      parameters
    });
    
    res.json({
      success: true,
      control_result: result,
      device: device_name,
      action: action,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error controlando dispositivo IoT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error controlando dispositivo',
      error: error.message
    });
  }
});

// Obtener perfiles de dispositivos disponibles
app.get('/api/iot/device-profiles', authenticate, async (req, res) => {
  try {
    const profiles = await callIoTSimulator('get_device_profiles', {});
    res.json({
      success: true,
      device_profiles: profiles,
      count: Object.keys(profiles).length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo perfiles IoT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo perfiles de dispositivos',
      error: error.message
    });
  }
});

// Ejecutar simulación de optimización energética
app.post('/api/iot/optimize-energy', authenticate, async (req, res) => {
  try {
    const { target_reduction_percent = 15, time_window_hours = 24 } = req.body;
    
    const optimization = await callIoTSimulator('optimize_energy_usage', {
      target_reduction_percent,
      time_window_hours
    });
    
    res.json({
      success: true,
      optimization_result: optimization,
      target_reduction: target_reduction_percent,
      time_window: time_window_hours,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en optimización energética:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error ejecutando optimización energética',
      error: error.message
    });
  }
});

// Simular anomalías en dispositivos
app.post('/api/iot/simulate-anomaly', authenticate, async (req, res) => {
  try {
    const { device_name, anomaly_type = 'high_consumption', duration_minutes = 30 } = req.body;
    
    const anomaly = await callIoTSimulator('simulate_anomaly', {
      device_name,
      anomaly_type,
      duration_minutes
    });
    
    res.json({
      success: true,
      anomaly_simulation: anomaly,
      device: device_name,
      type: anomaly_type,
      duration: duration_minutes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error simulando anomalía:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error simulando anomalía',
      error: error.message
    });
  }
});

// Dashboard IoT integrado
app.get('/api/iot/dashboard', authenticate, async (req, res) => {
  try {
    // Obtener datos del simulador IoT
    const [status, consumption, profiles] = await Promise.all([
      callIoTSimulator('get_status', {}),
      callIoTSimulator('get_current_consumption', {}),
      callIoTSimulator('get_device_profiles', {})
    ]);
    
    // Calcular estadísticas
    const activeDevices = Object.values(consumption.devices).filter(d => d.power > 0);
    const highConsumptionDevices = activeDevices.filter(d => d.power > 1000);
    const avgConsumption = activeDevices.length > 0 
      ? activeDevices.reduce((sum, d) => sum + d.power, 0) / activeDevices.length 
      : 0;
    
    res.json({
      success: true,
      iot_dashboard: {
        system_status: status,
        current_consumption: {
          total_power: consumption.total_power,
          device_count: Object.keys(consumption.devices).length,
          active_devices: activeDevices.length,
          high_consumption_devices: highConsumptionDevices.length,
          average_consumption: Math.round(avgConsumption)
        },
        devices: consumption.devices,
        device_profiles: profiles,
        recommendations: [
          {
            type: 'optimization',
            message: `${highConsumptionDevices.length} dispositivos de alto consumo detectados`,
            action: 'Considera optimizar su uso'
          },
          {
            type: 'efficiency',
            message: `Consumo promedio: ${Math.round(avgConsumption)}W por dispositivo`,
            action: activeDevices.length > 10 ? 'Revisa dispositivos innecesarios' : 'Buen nivel de eficiencia'
          }
        ]
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en dashboard IoT:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo dashboard IoT',
      error: error.message
    });
  }
});

// ==================== FIN RUTAS IOT ====================

// Ruta catch-all para servir el frontend en producción
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  const indexPath = path.join(buildPath, 'index.html');
  
  console.log('🔍 Verificando frontend build:');
  console.log('  Build path:', buildPath);
  console.log('  Index path:', indexPath);
  
  // Verificar si el archivo index.html existe
  const fs = require('fs');
  if (fs.existsSync(indexPath)) {
    console.log('✅ Frontend build encontrado, sirviendo archivos estáticos');
    app.use(express.static(buildPath));
    
    app.get('*', (req, res) => {
      console.log('📄 Sirviendo:', req.path);
      res.sendFile(indexPath);
    });
  } else {
    console.log('⚠️  Frontend build no encontrado, modo API únicamente');
    app.get('*', (req, res) => {
      res.status(404).json({ 
        error: 'Frontend not available', 
        message: 'API está funcionando en modo backend únicamente',
        api_status: 'active',
        frontend_status: 'not_available'
      });
    });
  }
}

console.log('🎯 Todas las rutas configuradas correctamente');
console.log('🚀 Iniciando servidor HTTP...');

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log('\n====================================');
  console.log('EnergiApp Backend API v2.0');
  console.log('====================================');
  console.log(`Servidor: http://0.0.0.0:${PORT}`);
  console.log(`Dashboard: http://0.0.0.0:${PORT}/api/dashboard`);
  console.log(`Login: POST http://0.0.0.0:${PORT}/api/auth/login`);
  console.log(`Registro: POST http://0.0.0.0:${PORT}/api/auth/register`);
  console.log(`Admin: GET http://0.0.0.0:${PORT}/api/admin/stats`);
  console.log(`Estado: http://0.0.0.0:${PORT}/api/health`);
  console.log('====================================');
  console.log('Usuarios de prueba:');
  console.log('   Admin: admin / admin123');
  console.log('   User1: usuario1 / user123');
  console.log('   User2: usuario2 / user123');
  console.log('====================================\n');
}).on('error', (error) => {
  console.error('❌ Error al iniciar el servidor:', error);
  process.exit(1);
});

// Manejo de errores del proceso
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado en backend:', error);
  console.error('Stack trace:', error.stack);
  
  // En producción, no salir inmediatamente para permitir debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Continuando ejecución en modo producción...');
    return;
  }
  
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada en backend:', reason);
  console.error('Promise:', promise);
  
  // En producción, no salir inmediatamente para permitir debugging
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  Continuando ejecución en modo producción...');
    return;
  }
  
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Mantener el proceso vivo en producción
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    console.log('💚 Servidor activo:', new Date().toISOString());
  }, 30000); // Log cada 30 segundos
}
