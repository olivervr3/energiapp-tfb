module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    apellidos: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100]
      }
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [8, 255]
      }
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    telefono: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        is: /^[+]?[\d\s\-\(\)]+$/
      }
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
      allowNull: true,
      validate: {
        min: 1,
        max: 10000
      }
    },
    num_habitantes: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 20
      }
    },
    tarifa_electrica: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Precio por kWh en euros',
      validate: {
        min: 0
      }
    },
    objetivo_ahorro: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Porcentaje de ahorro deseado',
      validate: {
        min: 0,
        max: 100
      }
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
    tableName: 'usuarios',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['activo']
      },
      {
        fields: ['ciudad']
      }
    ],
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    },
    hooks: {
      beforeCreate: async (usuario) => {
        if (usuario.email) {
          usuario.email = usuario.email.toLowerCase();
        }
      },
      beforeUpdate: async (usuario) => {
        if (usuario.email) {
          usuario.email = usuario.email.toLowerCase();
        }
        usuario.ultimo_acceso = new Date();
      }
    }
  });

  // Métodos de instancia
  Usuario.prototype.getNombreCompleto = function() {
    return `${this.nombre} ${this.apellidos}`;
  };

  Usuario.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password; // No incluir password en las respuestas JSON
    return values;
  };

  return Usuario;
};
