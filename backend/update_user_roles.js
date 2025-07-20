const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: console.log
});

// Definir el modelo Usuario actualizado
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ciudad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  codigo_postal: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  pais: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'España'
  },
  tipo_vivienda: {
    type: DataTypes.ENUM('piso', 'casa', 'apartamento', 'duplex', 'otro'),
    allowNull: true,
    defaultValue: 'piso'
  },
  metros_cuadrados: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  num_habitantes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 1
  },
  tarifa_electrica: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  objetivo_ahorro: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_acceso: {
    type: DataTypes.DATE,
    allowNull: true
  },
  preferencias: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      notificaciones: {
        email: true,
        push: true,
        alertas: true
      },
      idioma: 'es',
      tema: 'claro',
      unidades: {
        energia: 'kWh',
        potencia: 'W',
        moneda: 'EUR'
      }
    }
  }
}, {
  tableName: 'usuarios'
});

async function updateUserRoles() {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida.');

    // Sincronizar modelos (esto añadirá la columna role si no existe)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados.');

    // Actualizar el usuario test@test.com a rol 'user'
    const [updatedTest] = await Usuario.update(
      { role: 'user' },
      { where: { email: 'test@test.com' } }
    );
    console.log(`Usuario test@test.com actualizado: ${updatedTest > 0 ? 'Sí' : 'No'}`);

    // Crear o actualizar el usuario admin
    const hashedPassword = await bcrypt.hash('Admin123456', 10);
    
    const [adminUser, created] = await Usuario.findOrCreate({
      where: { email: 'admin@energiapp.com' },
      defaults: {
        nombre: 'Administrador',
        apellidos: 'Sistema',
        email: 'admin@energiapp.com',
        password: hashedPassword,
        role: 'admin',
        activo: true,
        ultimo_acceso: new Date()
      }
    });

    if (!created) {
      // Si ya existe, actualizar el rol y la contraseña
      await adminUser.update({
        role: 'admin',
        password: hashedPassword
      });
      console.log('Usuario admin actualizado con rol admin.');
    } else {
      console.log('Usuario admin creado con rol admin.');
    }

    // Mostrar todos los usuarios con sus roles
    const usuarios = await Usuario.findAll({
      attributes: ['email', 'role', 'nombre', 'apellidos']
    });
    
    console.log('\nUsuarios en la base de datos:');
    usuarios.forEach(user => {
      console.log(`- ${user.email}: ${user.role} (${user.nombre} ${user.apellidos})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateUserRoles();
