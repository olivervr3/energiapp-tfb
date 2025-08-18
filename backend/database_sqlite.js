const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

// Crear la base de datos en el directorio backend
const dbPath = path.join(__dirname, 'energiapp.db');
const db = new sqlite3.Database(dbPath);

console.log('📁 Base de datos SQLite:', dbPath);

// Crear tablas si no existen
db.serialize(() => {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    active BOOLEAN DEFAULT 1
  )`);

  // Tabla de dispositivos
  db.run(`CREATE TABLE IF NOT EXISTS devices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    location TEXT NOT NULL,
    power INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive',
    efficiency_rating TEXT DEFAULT 'A',
    controllable BOOLEAN DEFAULT 1,
    current_consumption REAL DEFAULT 0,
    daily_consumption REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Tabla de logs del sistema
  db.run(`CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insertar usuarios de prueba si no existen
  const insertDefaultUsers = () => {
    const defaultUsers = [
      {
        username: 'admin',
        email: 'admin@energiapp.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'usuario1',
        email: 'usuario1@test.com',
        password: 'user123',
        role: 'user'
      },
      {
        username: 'usuario2',
        email: 'usuario2@test.com',
        password: 'user123',
        role: 'user'
      }
    ];

    defaultUsers.forEach(user => {
      db.get('SELECT id FROM users WHERE username = ?', [user.username], (err, row) => {
        if (err) {
          console.error('Error verificando usuario:', err);
          return;
        }
        
        if (!row) {
          // Usuario no existe, crearlo
          const hashedPassword = bcrypt.hashSync(user.password, 10);
          db.run(
            'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
            [user.username, user.email, hashedPassword, user.role],
            function(err) {
              if (err) {
                console.error('Error insertando usuario:', err);
              } else {
                console.log(`✅ Usuario ${user.username} creado con ID: ${this.lastID}`);
                
                // Insertar dispositivos de ejemplo para usuario1
                if (user.username === 'usuario1') {
                  insertExampleDevices(this.lastID);
                }
              }
            }
          );
        } else {
          console.log(`👤 Usuario ${user.username} ya existe`);
        }
      });
    });
  };

  // Insertar dispositivos de ejemplo
  const insertExampleDevices = (userId) => {
    const exampleDevices = [
      {
        name: 'Refrigerador Samsung',
        type: 'refrigerator',
        location: 'Cocina',
        power: 150,
        status: 'active',
        efficiency_rating: 'A++',
        controllable: 0
      },
      {
        name: 'Aire Acondicionado LG',
        type: 'ac_heating',
        location: 'Salón',
        power: 2500,
        status: 'inactive',
        efficiency_rating: 'A+',
        controllable: 1
      },
      {
        name: 'TV Samsung 55"',
        type: 'tv',
        location: 'Salón',
        power: 120,
        status: 'active',
        efficiency_rating: 'A',
        controllable: 1
      }
    ];

    exampleDevices.forEach(device => {
      device.current_consumption = device.status === 'active' ? device.power * (0.8 + Math.random() * 0.4) : 0;
      device.daily_consumption = device.current_consumption * 24 / 1000;

      db.run(
        `INSERT INTO devices (user_id, name, type, location, power, status, efficiency_rating, controllable, current_consumption, daily_consumption) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, device.name, device.type, device.location, device.power, device.status, device.efficiency_rating, device.controllable, device.current_consumption, device.daily_consumption],
        function(err) {
          if (err) {
            console.error('Error insertando dispositivo:', err);
          } else {
            console.log(`🔌 Dispositivo ${device.name} creado para usuario ${userId}`);
          }
        }
      );
    });
  };

  // Esperar un momento y luego insertar usuarios por defecto
  setTimeout(insertDefaultUsers, 100);
});

// Funciones de la API
const dbAPI = {
  // Usuarios
  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, username, email, role, created_at, active FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getUserByUsername: (username) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserByEmail: (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  getUserById: (userId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  verifyPassword: (password, hash) => {
    return bcrypt.compareSync(password, hash);
  },

  updateUser: (userId, userData) => {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(userData).forEach(key => {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      });
      
      values.push(userId);
      
      db.run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) reject(err);
        else {
          db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      });
    });
  },

  createUser: (userData) => {
    return new Promise((resolve, reject) => {
      const { username, email, password, role = 'user' } = userData;
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      db.run(
        'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
        [username, email, hashedPassword, role],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, username, email, role });
        }
      );
    });
  },

  updateUserStatus: (userId, active) => {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET active = ? WHERE id = ?', [active, userId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  deleteUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM devices WHERE user_id = ?', [userId]);
        db.run('DELETE FROM system_logs WHERE user_id = ?', [userId]);
        db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        });
      });
    });
  },

  // Dispositivos
  getUserDevices: (userId) => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM devices WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  getAllDevices: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT d.*, u.username as owner 
        FROM devices d 
        JOIN users u ON d.user_id = u.id 
        ORDER BY d.created_at DESC
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  createDevice: (deviceData) => {
    return new Promise((resolve, reject) => {
      const { user_id, name, type, location, power, efficiency = 'A', controllable = true } = deviceData;
      
      db.run(
        `INSERT INTO devices (user_id, name, type, location, power, efficiency_rating, controllable, current_consumption, daily_consumption) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        [user_id, name, type, location, power, efficiency, controllable ? 1 : 0],
        function(err) {
          if (err) reject(err);
          else {
            // Obtener el dispositivo creado
            db.get('SELECT * FROM devices WHERE id = ?', [this.lastID], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          }
        }
      );
    });
  },

  getDeviceById: (deviceId) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM devices WHERE id = ?', [deviceId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  updateDevice: (deviceId, deviceData) => {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(deviceData).forEach(key => {
        fields.push(`${key} = ?`);
        values.push(deviceData[key]);
      });
      
      values.push(deviceId);
      
      db.run(`UPDATE devices SET ${fields.join(', ')} WHERE id = ?`, values, function(err) {
        if (err) reject(err);
        else {
          db.get('SELECT * FROM devices WHERE id = ?', [deviceId], (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        }
      });
    });
  },

  updateDeviceStatus: (deviceId, status) => {
    return new Promise((resolve, reject) => {
      // Primero obtener el dispositivo para calcular consumo
      db.get('SELECT * FROM devices WHERE id = ?', [deviceId], (err, device) => {
        if (err) {
          reject(err);
          return;
        }

        const currentConsumption = status === 'active' ? 
          device.power * (0.8 + Math.random() * 0.4) : 0;
        const dailyConsumption = currentConsumption * 24 / 1000;

        db.run(
          'UPDATE devices SET status = ?, current_consumption = ?, daily_consumption = ? WHERE id = ?',
          [status, currentConsumption, dailyConsumption, deviceId],
          function(err) {
            if (err) reject(err);
            else {
              // Devolver el dispositivo actualizado
              db.get('SELECT * FROM devices WHERE id = ?', [deviceId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
              });
            }
          }
        );
      });
    });
  },

  deleteDevice: (deviceId) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM devices WHERE id = ?', [deviceId], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });
  },

  // Logs del sistema
  addSystemLog: (userId, action, details = null) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO system_logs (user_id, action, details) VALUES (?, ?, ?)',
        [userId, action, details],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  },

  getSystemLogs: (limit = 100) => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT sl.*, u.username 
        FROM system_logs sl 
        LEFT JOIN users u ON sl.user_id = u.id 
        ORDER BY sl.timestamp DESC 
        LIMIT ?
      `, [limit], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // Estadísticas
  getAdminStats: () => {
    return new Promise((resolve, reject) => {
      const stats = {};
      
      // Contar usuarios
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        stats.total_users = row.count;

        // Contar dispositivos totales
        db.get('SELECT COUNT(*) as count FROM devices', (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          stats.total_devices = row.count;

          // Contar dispositivos activos
          db.get('SELECT COUNT(*) as count FROM devices WHERE status = "active"', (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            stats.active_devices = row.count;

            // Calcular consumo total
            db.get('SELECT SUM(daily_consumption) as total FROM devices WHERE status = "active"', (err, row) => {
              if (err) {
                reject(err);
                return;
              }
              stats.total_consumption_kwh = row.total || 0;

              resolve(stats);
            });
          });
        });
      });
    });
  }
};

// Cerrar base de datos al terminar el proceso
process.on('SIGINT', () => {
  console.log('\n🔒 Cerrando base de datos SQLite...');
  db.close((err) => {
    if (err) {
      console.error('Error cerrando base de datos:', err);
    } else {
      console.log('✅ Base de datos cerrada correctamente');
    }
    process.exit(0);
  });
});

module.exports = { db, dbAPI };
