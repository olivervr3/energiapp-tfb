const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function updateUserRoles() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Añadir columna role si no existe
    await new Promise((resolve, reject) => {
      db.run(`ALTER TABLE usuarios ADD COLUMN role TEXT DEFAULT 'user'`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
          reject(err);
        } else {
          console.log('Columna role agregada o ya existía');
          resolve();
        }
      });
    });

    // Actualizar usuario test@test.com a rol 'user'
    await new Promise((resolve, reject) => {
      db.run(`UPDATE usuarios SET role = 'user' WHERE email = 'test@test.com'`, (err) => {
        if (err) reject(err);
        else {
          console.log('Usuario test@test.com actualizado a role: user');
          resolve();
        }
      });
    });

    // Crear contraseña hash para admin
    const hashedPassword = await bcrypt.hash('Admin123456', 10);

    // Verificar si existe el usuario admin
    const adminExists = await new Promise((resolve, reject) => {
      db.get(`SELECT id FROM usuarios WHERE email = 'admin@energiapp.com'`, (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });

    if (adminExists) {
      // Actualizar usuario admin existente
      await new Promise((resolve, reject) => {
        db.run(`UPDATE usuarios SET role = 'admin', password = ? WHERE email = 'admin@energiapp.com'`, 
          [hashedPassword], (err) => {
            if (err) reject(err);
            else {
              console.log('Usuario admin@energiapp.com actualizado a role: admin');
              resolve();
            }
          });
      });
    } else {
      // Crear nuevo usuario admin
      await new Promise((resolve, reject) => {
        const sql = `INSERT INTO usuarios (
          id, nombre, apellidos, email, password, role, activo, 
          tipo_vivienda, num_habitantes, pais, ultimo_acceso, 
          preferencias, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const values = [
          require('crypto').randomUUID(),
          'Administrador',
          'Sistema', 
          'admin@energiapp.com',
          hashedPassword,
          'admin',
          1,
          'piso',
          1,
          'España',
          new Date().toISOString(),
          JSON.stringify({
            notificaciones: { email: true, push: true, alertas: true },
            idioma: 'es',
            tema: 'claro',
            unidades: { energia: 'kWh', potencia: 'W', moneda: 'EUR' }
          }),
          new Date().toISOString(),
          new Date().toISOString()
        ];
        
        db.run(sql, values, (err) => {
          if (err) reject(err);
          else {
            console.log('Usuario admin@energiapp.com creado con role: admin');
            resolve();
          }
        });
      });
    }

    // Mostrar todos los usuarios con sus roles
    const usuarios = await new Promise((resolve, reject) => {
      db.all(`SELECT email, role, nombre, apellidos FROM usuarios`, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    console.log('\nUsuarios en la base de datos:');
    usuarios.forEach(user => {
      console.log(`- ${user.email}: ${user.role || 'user'} (${user.nombre} ${user.apellidos})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

updateUserRoles();
