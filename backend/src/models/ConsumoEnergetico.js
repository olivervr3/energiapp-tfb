module.exports = (sequelize, DataTypes) => {
  const ConsumoEnergetico = sequelize.define('ConsumoEnergetico', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    dispositivo_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'dispositivos',
        key: 'id'
      }
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    consumo_kwh: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Consumo en kilovatios-hora',
      validate: {
        min: 0
      }
    },
    potencia_instantanea: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Potencia instantánea en vatios',
      validate: {
        min: 0
      }
    },
    voltaje: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
      comment: 'Voltaje en voltios',
      validate: {
        min: 0,
        max: 1000
      }
    },
    corriente: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      comment: 'Corriente en amperios',
      validate: {
        min: 0
      }
    },
    factor_potencia: {
      type: DataTypes.DECIMAL(4, 3),
      allowNull: true,
      comment: 'Factor de potencia (0-1)',
      validate: {
        min: 0,
        max: 1
      }
    },
    temperatura_ambiente: {
      type: DataTypes.DECIMAL(4, 1),
      allowNull: true,
      comment: 'Temperatura ambiente en grados Celsius'
    },
    humedad: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Humedad relativa en porcentaje',
      validate: {
        min: 0,
        max: 100
      }
    },
    costo_estimado: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Costo estimado en euros'
    },
    periodo: {
      type: DataTypes.ENUM('punta', 'llano', 'valle'),
      allowNull: true,
      comment: 'Periodo tarifario'
    },
    es_estimado: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si el valor es estimado o medido'
    },
    calidad_dato: {
      type: DataTypes.ENUM('excelente', 'buena', 'regular', 'mala'),
      allowNull: true,
      defaultValue: 'buena'
    },
    metadatos: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      comment: 'Información adicional sobre la medición'
    }
  }, {
    tableName: 'consumo_energetico',
    indexes: [
      {
        fields: ['dispositivo_id', 'timestamp']
      },
      {
        fields: ['usuario_id', 'timestamp']
      },
      {
        fields: ['timestamp']
      },
      {
        fields: ['periodo']
      },
      {
        fields: ['es_estimado']
      }
    ],
    hooks: {
      beforeCreate: async (consumo) => {
        // Calcular costo estimado si no se proporciona
        if (!consumo.costo_estimado && consumo.consumo_kwh) {
          const tarifaPromedio = 0.25; // €/kWh promedio
          consumo.costo_estimado = parseFloat((consumo.consumo_kwh * tarifaPromedio).toFixed(4));
        }
        
        // Determinar periodo tarifario basado en la hora
        if (!consumo.periodo) {
          const hora = new Date(consumo.timestamp).getHours();
          if (hora >= 10 && hora < 14 || hora >= 18 && hora < 22) {
            consumo.periodo = 'punta';
          } else if (hora >= 8 && hora < 10 || hora >= 14 && hora < 18 || hora >= 22 && hora < 24) {
            consumo.periodo = 'llano';
          } else {
            consumo.periodo = 'valle';
          }
        }
      }
    }
  });

  // Métodos estáticos
  ConsumoEnergetico.obtenerConsumoPorPeriodo = async function(usuarioId, fechaInicio, fechaFin) {
    const { Op } = require('sequelize');
    
    return await this.findAll({
      where: {
        usuario_id: usuarioId,
        timestamp: {
          [Op.between]: [fechaInicio, fechaFin]
        }
      },
      order: [['timestamp', 'ASC']]
    });
  };

  ConsumoEnergetico.obtenerEstadisticasPorDispositivo = async function(dispositivoId, dias = 30) {
    const { Op, fn, col } = require('sequelize');
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    return await this.findOne({
      where: {
        dispositivo_id: dispositivoId,
        timestamp: {
          [Op.gte]: fechaInicio
        }
      },
      attributes: [
        [fn('COUNT', col('id')), 'total_registros'],
        [fn('SUM', col('consumo_kwh')), 'consumo_total'],
        [fn('AVG', col('consumo_kwh')), 'consumo_promedio'],
        [fn('MAX', col('consumo_kwh')), 'consumo_maximo'],
        [fn('MIN', col('consumo_kwh')), 'consumo_minimo'],
        [fn('SUM', col('costo_estimado')), 'costo_total']
      ],
      raw: true
    });
  };

  // Métodos de instancia
  ConsumoEnergetico.prototype.obtenerEficiencia = function() {
    if (!this.potencia_instantanea || this.potencia_instantanea === 0) {
      return null;
    }
    
    const potenciaKW = this.potencia_instantanea / 1000;
    return parseFloat((this.consumo_kwh / potenciaKW).toFixed(3));
  };

  ConsumoEnergetico.prototype.esConsumoAnomalo = function(promedioHistorico, desviacionEstandar) {
    const umbralSuperior = promedioHistorico + (2 * desviacionEstandar);
    const umbralInferior = Math.max(0, promedioHistorico - (2 * desviacionEstandar));
    
    return this.consumo_kwh > umbralSuperior || this.consumo_kwh < umbralInferior;
  };

  return ConsumoEnergetico;
};
