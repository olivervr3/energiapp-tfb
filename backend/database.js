// Base de datos simulada en memoria para usuarios y dispositivos
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@energiapp.com',
    password: 'Admin123456', // Cambiado para coincidir con la base de datos SQLite
    role: 'admin',
    created_at: new Date().toISOString(),
    active: true
  },
  {
    id: 2,
    username: 'test',
    email: 'test@test.com',
    password: 'Test123456', // Usuario de prueba principal
    role: 'user',
    created_at: new Date().toISOString(),
    active: true
  },
  {
    id: 3,
    username: 'TEST',
    email: 'TEST@test.com',
    password: '123456', // Usuario de prueba simple
    role: 'user',
    created_at: new Date().toISOString(),
    active: true
  }
];

let userDevices = {
  1: [], // Admin no tiene dispositivos propios
  2: [ // Dispositivos del usuario1
    {
      id: 1,
      name: 'Refrigerador Samsung',
      type: 'refrigerator',
      location: 'Cocina',
      power: 150,
      status: 'active',
      efficiency: 'A++',
      controllable: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Aire Acondicionado LG',
      type: 'air_conditioning',
      location: 'Salón',
      power: 1800, // Reducido de 2200W a 1800W (más realista)
      status: 'active',
      efficiency: 'A+',
      controllable: true,
      created_at: new Date().toISOString()
    }
  ],
  3: [ // Dispositivos del usuario2
    {
      id: 3,
      name: 'Smart TV Samsung',
      type: 'entertainment',
      location: 'Salón',
      power: 120,
      status: 'active',
      efficiency: 'A',
      controllable: true,
      created_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Microondas Panasonic',
      type: 'kitchen',
      location: 'Cocina',
      power: 900,
      status: 'inactive',
      efficiency: 'B+',
      controllable: true,
      created_at: new Date().toISOString()
    }
  ]
};

let deviceTypes = [
  { id: 'refrigerator', name: 'Refrigerador', icon: '🧊', typical_power: '100-200W' },
  { id: 'air_conditioning', name: 'Aire Acondicionado', icon: '❄️', typical_power: '1500-3000W' },
  { id: 'lighting', name: 'Iluminación', icon: '💡', typical_power: '10-100W' },
  { id: 'entertainment', name: 'Entretenimiento', icon: '📺', typical_power: '50-300W' },
  { id: 'kitchen', name: 'Electrodomésticos Cocina', icon: '🍳', typical_power: '500-2000W' },
  { id: 'heating', name: 'Calefacción', icon: '🔥', typical_power: '1000-3000W' },
  { id: 'washing', name: 'Lavado', icon: '👕', typical_power: '500-2500W' }
];

// Sesiones activas (simulando JWT)
let activeSessions = {};

module.exports = {
  users,
  userDevices,
  deviceTypes,
  activeSessions
};
