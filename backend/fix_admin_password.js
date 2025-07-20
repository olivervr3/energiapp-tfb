const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function fixAdminPassword() {
  try {
    console.log('Actualizando contraseña del admin...');
    
    // Crear nueva contraseña hash
    const hashedPassword = await bcrypt.hash('Admin123456', 10);
    console.log('Nueva contraseña hash generada:', hashedPassword.substring(0, 20) + '...');
    
    // Actualizar la contraseña del admin
    await new Promise((resolve, reject) => {
      db.run(`UPDATE usuarios SET password = ? WHERE email = 'admin@energiapp.com'`, 
        [hashedPassword], (err) => {
          if (err) reject(err);
          else {
            console.log('Contraseña del admin actualizada exitosamente');
            resolve();
          }
        });
    });

    // Verificar que se actualizó
    const admin = await new Promise((resolve, reject) => {
      db.get(`SELECT email, role, nombre, apellidos FROM usuarios WHERE email = 'admin@energiapp.com'`, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    console.log('Usuario admin verificado:');
    console.log(`- Email: ${admin.email}`);
    console.log(`- Role: ${admin.role}`);
    console.log(`- Nombre: ${admin.nombre} ${admin.apellidos}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    db.close();
  }
}

fixAdminPassword();
