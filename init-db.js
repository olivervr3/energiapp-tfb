const { sequelize } = require('./backend/src/config/database');
const bcrypt = require('bcryptjs');

async function initializeDatabase() {
  try {
    console.log('Inicializando base de datos...');
    
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: false });
    console.log('Tablas sincronizadas');

    // Verificar si existen usuarios
    const [results] = await sequelize.query("SELECT COUNT(*) as count FROM usuarios");
    const userCount = results[0].count;

    if (userCount === 0) {
      console.log('Creando usuarios por defecto...');
      
      // Crear usuario admin
      const adminPassword = await bcrypt.hash('Admin123456', 10);
      await sequelize.query(`
        INSERT INTO usuarios (email, password, nombre, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `, {
        replacements: ['admin@energiapp.com', adminPassword, 'Administrador', 'admin']
      });

      // Crear usuario de prueba
      const testPassword = await bcrypt.hash('Test123456', 10);
      await sequelize.query(`
        INSERT INTO usuarios (email, password, nombre, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `, {
        replacements: ['test@test.com', testPassword, 'Usuario de Prueba', 'user']
      });

      console.log('Usuarios creados correctamente');
    } else {
      console.log(`Base de datos ya tiene ${userCount} usuarios`);
    }

    console.log('Inicialización de base de datos completada');
    return true;
  } catch (error) {
    console.error('Error inicializando base de datos:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };
