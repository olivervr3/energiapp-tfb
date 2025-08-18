// Base de datos para producción en Render (sin SQLite)
// Usa arrays en memoria que se inicializan al arrancar

const bcrypt = require('bcryptjs');

// Datos en memoria para producción
let users = [];
let userDevices = {};
let systemLogs = [];
let nextUserId = 1;
let nextDeviceId = 1;

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

// Inicializar datos de prueba
const initializeData = () => {
  console.log('🔄 Inicializando base de datos de producción...');
  
  // Usuarios por defecto
  const defaultUsers = [
    {
      id: nextUserId++,
      username: 'admin',
      email: 'admin@energiapp.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
      created_at: new Date().toISOString(),
      active: true
    },
    {
      id: nextUserId++,
      username: 'usuario1',
      email: 'usuario1@test.com',
      password: bcrypt.hashSync('user123', 10),
      role: 'user',
      created_at: new Date().toISOString(),
      active: true
    },
    {
      id: nextUserId++,
      username: 'usuario2',
      email: 'usuario2@test.com',
      password: bcrypt.hashSync('user123', 10),
      role: 'user',
      created_at: new Date().toISOString(),
      active: true
    }
  ];

  users = [...defaultUsers];
  
  // Dispositivos por defecto para usuario1 (id: 2)
  const defaultDevices = [
    {
      id: nextDeviceId++,
      user_id: 2,
      name: 'Refrigerador Samsung',
      type: 'refrigerator',
      location: 'Cocina',
      power: 150,
      status: 'active',
      efficiency_rating: 'A++',
      controllable: false,
      current_consumption: 150,
      daily_consumption: 3.6,
      created_at: new Date().toISOString()
    },
    {
      id: nextDeviceId++,
      user_id: 2,
      name: 'TV Samsung 55"',
      type: 'entertainment',
      location: 'Salón',
      power: 120,
      status: 'active',
      efficiency_rating: 'A',
      controllable: true,
      current_consumption: 120,
      daily_consumption: 2.88,
      created_at: new Date().toISOString()
    }
  ];

  // Inicializar userDevices
  users.forEach(user => {
    userDevices[user.id] = [];
  });
  
  defaultDevices.forEach(device => {
    userDevices[device.user_id].push(device);
  });

  console.log(`✅ ${users.length} usuarios inicializados`);
  console.log(`✅ ${defaultDevices.length} dispositivos inicializados`);
};

// API compatible con SQLite
const dbAPI = {
  // Usuarios
  getAllUsers: () => {
    return Promise.resolve(users.map(u => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
      active: u.active
    })));
  },

  getUserByUsername: (username) => {
    const user = users.find(u => u.username === username);
    return Promise.resolve(user);
  },

  getUserByEmail: (email) => {
    const user = users.find(u => u.email === email);
    return Promise.resolve(user);
  },

  getUserById: (userId) => {
    const user = users.find(u => u.id === userId);
    return Promise.resolve(user);
  },

  verifyPassword: (password, hash) => {
    return bcrypt.compareSync(password, hash);
  },

  updateUser: (userId, userData) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return Promise.resolve(null);
    
    Object.assign(users[userIndex], userData);
    return Promise.resolve(users[userIndex]);
  },

  createUser: (userData) => {
    const { username, email, password, role = 'user', active = true } = userData;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const newUser = {
      id: nextUserId++,
      username,
      email,
      password: hashedPassword,
      role,
      created_at: new Date().toISOString(),
      active
    };
    
    users.push(newUser);
    userDevices[newUser.id] = [];
    
    return Promise.resolve({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });
  },

  deleteUser: (userId) => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return Promise.resolve({ changes: 0 });
    
    users.splice(userIndex, 1);
    delete userDevices[userId];
    
    return Promise.resolve({ changes: 1 });
  },

  // Dispositivos
  getUserDevices: (userId) => {
    const devices = userDevices[userId] || [];
    return Promise.resolve(devices);
  },

  getAllDevices: () => {
    const allDevices = [];
    Object.values(userDevices).forEach(devices => {
      allDevices.push(...devices);
    });
    return Promise.resolve(allDevices);
  },

  createDevice: (deviceData) => {
    const { user_id, name, type, location, power, efficiency = 'A', controllable = true } = deviceData;
    
    const newDevice = {
      id: nextDeviceId++,
      user_id,
      name,
      type,
      location,
      power,
      status: 'inactive',
      efficiency_rating: efficiency,
      controllable,
      current_consumption: 0,
      daily_consumption: 0,
      created_at: new Date().toISOString()
    };
    
    if (!userDevices[user_id]) {
      userDevices[user_id] = [];
    }
    
    userDevices[user_id].push(newDevice);
    return Promise.resolve(newDevice);
  },

  getDeviceById: (deviceId) => {
    for (const devices of Object.values(userDevices)) {
      const device = devices.find(d => d.id === deviceId);
      if (device) return Promise.resolve(device);
    }
    return Promise.resolve(null);
  },

  updateDevice: (deviceId, deviceData) => {
    for (const devices of Object.values(userDevices)) {
      const deviceIndex = devices.findIndex(d => d.id === deviceId);
      if (deviceIndex !== -1) {
        Object.assign(devices[deviceIndex], deviceData);
        return Promise.resolve(devices[deviceIndex]);
      }
    }
    return Promise.resolve(null);
  },

  deleteDevice: (deviceId) => {
    for (const devices of Object.values(userDevices)) {
      const deviceIndex = devices.findIndex(d => d.id === deviceId);
      if (deviceIndex !== -1) {
        devices.splice(deviceIndex, 1);
        return Promise.resolve({ changes: 1 });
      }
    }
    return Promise.resolve({ changes: 0 });
  },

  // Estadísticas
  getAdminStats: () => {
    const activeUsers = users.filter(u => u.active);
    const allDevices = Object.values(userDevices).flat();
    const activeDevices = allDevices.filter(d => d.status === 'active');
    
    return Promise.resolve({
      total_users: activeUsers.length,
      total_devices: allDevices.length,
      active_devices: activeDevices.length,
      total_consumption_kwh: activeDevices.reduce((sum, d) => sum + (d.daily_consumption || 0), 0)
    });
  }
};

// Inicializar al cargar
initializeData();

module.exports = { dbAPI, deviceTypes };
