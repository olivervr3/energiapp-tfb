module.exports = (sequelize, DataTypes) => {
  const Dispositivo = sequelize.define('Dispositivo', {
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
        len: [1, 100]
      }
    },
    tipo: {
      type: DataTypes.ENUM(
        'refrigerador', 'lavadora', 'lavavajillas', 'horno', 'microondas',
        'television', 'ordenador', 'aire_acondicionado', 'calefaccion',
        'iluminacion', 'router', 'consola', 'aspiradora', 'secadora',
        'plancha', 'tostadora', 'cafetera', 'termo_electrico', 'otro'
      ),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    modelo: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    potencia_nominal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Potencia nominal en vatios (W)',
      validate: {
        min: 0.1,
        max: 50000
      }
    },
    eficiencia_energetica: {
      type: DataTypes.ENUM('A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'),
      allowNull: true
    },
    ubicacion: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Habitación o zona donde está ubicado'
    },
    fecha_instalacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('activo', 'inactivo', 'mantenimiento', 'averiado'),
      allowNull: false,
      defaultValue: 'activo'
    },
    mac_address: {
      type: DataTypes.STRING(17),
      allowNull: true,
      unique: true,
      validate: {
        is: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
      }
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    firmware_version: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    ultimo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    proximo_mantenimiento: {
      type: DataTypes.DATE,
      allowNull: true
    },
    costo_aproximado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Costo de adquisición en euros'
    },
    vida_util_estimada: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Vida útil estimada en años'
    },
    configuracion: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {
        intervalo_medicion: 60, // segundos
        umbral_alerta: null,
        modo_ahorro: false,
        programacion: {
          encendido_automatico: false,
          apagado_automatico: false,
          horarios: []
        }
      }
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    }
  }, {
    tableName: 'dispositivos',
    indexes: [
      {
        fields: ['usuario_id']
      },
      {
        fields: ['tipo']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['activo']
      },
      {
        unique: true,
        fields: ['mac_address'],
        where: {
          mac_address: {
            [sequelize.Sequelize.Op.ne]: null
          }
        }
      }
    ]
  });

  // Métodos de instancia
  Dispositivo.prototype.calcularConsumoEstimadoMensual = function() {
    // Estimación basada en potencia nominal y uso promedio
    const horasUsoPromedio = this.getHorasUsoPromedio();
    const consumoKWhMes = (this.potencia_nominal * horasUsoPromedio * 30) / 1000;
    return parseFloat(consumoKWhMes.toFixed(2));
  };

  Dispositivo.prototype.getHorasUsoPromedio = function() {
    // Horas de uso promedio según tipo de dispositivo
    const usoPromedio = {
      'refrigerador': 24,
      'television': 5,
      'ordenador': 8,
      'aire_acondicionado': 6,
      'iluminacion': 6,
      'lavadora': 1,
      'lavavajillas': 1,
      'horno': 0.5,
      'microondas': 0.3,
      'router': 24,
      'otro': 4
    };
    return usoPromedio[this.tipo] || 4;
  };

  Dispositivo.prototype.estaEnMantenimiento = function() {
    return this.estado === 'mantenimiento' || this.estado === 'averiado';
  };

  Dispositivo.prototype.necesitaMantenimiento = function() {
    if (!this.proximo_mantenimiento) return false;
    return new Date() >= new Date(this.proximo_mantenimiento);
  };

  return Dispositivo;
};
