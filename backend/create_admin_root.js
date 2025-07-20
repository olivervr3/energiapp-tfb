const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// La base de datos que usa el backend cuando se ejecuta desde el directorio raíz TFB
const dbPath = '../database.sqlite';
const db = new sqlite3.Database(dbPath);

console.log('Creando usuario admin en la base de datos raíz...');

const createAdminUser = async () => {
  try {
    const hashedPassword = await bcrypt.hash('Admin123456', 10);
    const adminId = crypto.randomUUID();
    
    const sql = `INSERT OR REPLACE INTO usuarios (
      id, nombre, apellidos, email, password, role, activo,
      tipo_vivienda, num_habitantes, pais, ultimo_acceso,
      preferencias, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    const values = [
      adminId, 'Administrador', 'Sistema', 'admin@energiapp.com',
      hashedPassword, 'admin', 1, 'piso', 1, 'España',
      new Date().toISOString(),
      JSON.stringify({
        notificaciones: { email: true, push: true, alertas: true },
        idioma: 'es', tema: 'claro',
        unidades: { energia: 'kWh', potencia: 'W', moneda: 'EUR' }
      }),
      new Date().toISOString(), new Date().toISOString()
    ];
    
    db.run(sql, values, (err) => {
      if (err) {
        console.error('Error:', err);
      } else {
        console.log('Usuario admin creado/actualizado en la base de datos raíz');
        
        // Verificar que se creó
        db.get('SELECT email, role, activo FROM usuarios WHERE email = ?', ['admin@energiapp.com'], (err, row) => {
          if (err) console.error('Error verificando:', err);
          else if (row) console.log('✅ Admin verificado:', row);
          else console.log('❌ Admin no encontrado');
          db.close();
        });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    db.close();
  }
};

createAdminUser();
