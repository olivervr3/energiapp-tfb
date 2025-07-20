const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Configuración de la base de datos
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: process.env.NODE_ENV === 'development' ? 
      (msg) => logger.debug(msg) : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    // timezone: '+02:00', // Removido: SQLite no soporta timezone personalizado
  }
);

// Importar modelos
const Usuario = require('../models/Usuario')(sequelize, Sequelize.DataTypes);
const Dispositivo = require('../models/Dispositivo')(sequelize, Sequelize.DataTypes);
const ConsumoEnergetico = require('../models/ConsumoEnergetico')(sequelize, Sequelize.DataTypes);
const Prediccion = require('../models/Prediccion')(sequelize, Sequelize.DataTypes);
// const Recomendacion = require('../models/Recomendacion')(sequelize, Sequelize.DataTypes);
// const AlertaEnergetica = require('../models/AlertaEnergetica')(sequelize, Sequelize.DataTypes);

// Definir asociaciones
const defineAssociations = () => {
  // Usuario - Dispositivo (1:N)
  Usuario.hasMany(Dispositivo, {
    foreignKey: 'usuario_id',
    as: 'dispositivos',
    onDelete: 'CASCADE'
  });
  Dispositivo.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Dispositivo - ConsumoEnergetico (1:N)
  Dispositivo.hasMany(ConsumoEnergetico, {
    foreignKey: 'dispositivo_id',
    as: 'consumos',
    onDelete: 'CASCADE'
  });
  ConsumoEnergetico.belongsTo(Dispositivo, {
    foreignKey: 'dispositivo_id',
    as: 'dispositivo'
  });

  // Usuario - ConsumoEnergetico (1:N)
  Usuario.hasMany(ConsumoEnergetico, {
    foreignKey: 'usuario_id',
    as: 'consumos',
    onDelete: 'CASCADE'
  });
  ConsumoEnergetico.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Usuario - Prediccion (1:N)
  Usuario.hasMany(Prediccion, {
    foreignKey: 'usuario_id',
    as: 'predicciones',
    onDelete: 'CASCADE'
  });
  Prediccion.belongsTo(Usuario, {
    foreignKey: 'usuario_id',
    as: 'usuario'
  });

  // Comentadas - modelos no implementados
  // Usuario - Recomendacion (1:N)
  // Usuario.hasMany(Recomendacion, {
  //   foreignKey: 'usuario_id',
  //   as: 'recomendaciones',
  //   onDelete: 'CASCADE'
  // });
  // Recomendacion.belongsTo(Usuario, {
  //   foreignKey: 'usuario_id',
  //   as: 'usuario'
  // });

  // Usuario - AlertaEnergetica (1:N)
  // Usuario.hasMany(AlertaEnergetica, {
  //   foreignKey: 'usuario_id',
  //   as: 'alertas',
  //   onDelete: 'CASCADE'
  // });
  // AlertaEnergetica.belongsTo(Usuario, {
  //   foreignKey: 'usuario_id',
  //   as: 'usuario'
  // });

  // Dispositivo - AlertaEnergetica (1:N)
  // Dispositivo.hasMany(AlertaEnergetica, {
  //   foreignKey: 'dispositivo_id',
  //   as: 'alertas',
  //   onDelete: 'CASCADE'
  // });
  // AlertaEnergetica.belongsTo(Dispositivo, {
  //   foreignKey: 'dispositivo_id',
  //   as: 'dispositivo'
  // });
};

// Ejecutar asociaciones
defineAssociations();

// Exportar instancia de Sequelize y modelos
module.exports = {
  sequelize,
  Sequelize,
  Usuario,
  Dispositivo,
  ConsumoEnergetico,
  Prediccion,
  // Recomendacion,
  // AlertaEnergetica
};
