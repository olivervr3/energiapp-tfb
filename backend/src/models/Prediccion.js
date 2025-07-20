module.exports = (sequelize, DataTypes) => {
  const Prediccion = sequelize.define('Prediccion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    usuario_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    dispositivo_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'dispositivos',
        key: 'id'
      }
    },
    fecha_prediccion: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha y hora para la cual se hace la predicción'
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha y hora cuando se generó la predicción'
    },
    tipo_prediccion: {
      type: DataTypes.ENUM('horaria', 'diaria', 'semanal', 'mensual'),
      allowNull: false,
      defaultValue: 'horaria'
    },
    consumo_predicho: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      comment: 'Consumo energético predicho en kWh',
      validate: {
        min: 0
      }
    },
    consumo_real: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Consumo real medido posteriormente en kWh',
      validate: {
        min: 0
      }
    },
    margen_error: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      comment: 'Margen de error de la predicción en kWh'
    },
    confianza: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Nivel de confianza de la predicción (0-100)',
      validate: {
        min: 0,
        max: 100
      }
    },
    costo_predicho: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Costo estimado de la predicción en euros'
    },
    costo_real: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
      comment: 'Costo real calculado posteriormente en euros'
    },
    modelo_utilizado: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del modelo de ML utilizado'
    },
    version_modelo: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Versión del modelo utilizado'
    },
    parametros_modelo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Parámetros utilizados en el modelo'
    },
    variables_entrada: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Variables utilizadas como entrada para la predicción'
    },
    metricas_modelo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Métricas de rendimiento del modelo',
      defaultValue: {
        mae: null,      // Mean Absolute Error
        mse: null,      // Mean Squared Error
        rmse: null,     // Root Mean Squared Error
        mape: null,     // Mean Absolute Percentage Error
        r2: null        // R-squared
      }
    },
    factores_externos: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Factores externos considerados',
      defaultValue: {
        temperatura: null,
        humedad: null,
        dia_semana: null,
        es_festivo: false,
        estacion_año: null,
        precio_energia: null
      }
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'validada', 'incorrecta', 'expirada'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    precision_calculada: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      comment: 'Precisión calculada después de validar (0-100)'
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'predicciones',
    indexes: [
      {
        fields: ['usuario_id', 'fecha_prediccion']
      },
      {
        fields: ['dispositivo_id', 'fecha_prediccion']
      },
      {
        fields: ['tipo_prediccion']
      },
      {
        fields: ['estado']
      },
      {
        fields: ['fecha_creacion']
      },
      {
        fields: ['modelo_utilizado']
      }
    ],
    hooks: {
      beforeCreate: async (prediccion) => {
        // Calcular costo predicho si no se proporciona
        if (!prediccion.costo_predicho && prediccion.consumo_predicho) {
          const tarifaPromedio = 0.25; // €/kWh promedio
          prediccion.costo_predicho = parseFloat((prediccion.consumo_predicho * tarifaPromedio).toFixed(4));
        }
      },
      beforeUpdate: async (prediccion) => {
        // Calcular precisión si se actualiza el consumo real
        if (prediccion.consumo_real !== undefined && prediccion.consumo_predicho) {
          const errorAbsoluto = Math.abs(prediccion.consumo_real - prediccion.consumo_predicho);
          const errorPorcentual = (errorAbsoluto / prediccion.consumo_real) * 100;
          prediccion.precision_calculada = Math.max(0, 100 - errorPorcentual);
          
          // Actualizar estado basado en la precisión
          if (prediccion.precision_calculada >= 85) {
            prediccion.estado = 'validada';
          } else if (prediccion.precision_calculada < 60) {
            prediccion.estado = 'incorrecta';
          }
        }
      }
    }
  });

  // Métodos estáticos
  Prediccion.obtenerPrecisionModelo = async function(modeloUtilizado, dias = 30) {
    const { Op, fn, col } = require('sequelize');
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);

    return await this.findOne({
      where: {
        modelo_utilizado: modeloUtilizado,
        consumo_real: {
          [Op.ne]: null
        },
        fecha_creacion: {
          [Op.gte]: fechaInicio
        }
      },
      attributes: [
        [fn('COUNT', col('id')), 'total_predicciones'],
        [fn('AVG', col('precision_calculada')), 'precision_promedio'],
        [fn('STDDEV', col('precision_calculada')), 'desviacion_precision'],
        [fn('MIN', col('precision_calculada')), 'precision_minima'],
        [fn('MAX', col('precision_calculada')), 'precision_maxima']
      ],
      raw: true
    });
  };

  Prediccion.obtenerPrediccionesPendientes = async function() {
    const ahora = new Date();
    
    return await this.findAll({
      where: {
        estado: 'pendiente',
        fecha_prediccion: {
          [Op.lte]: ahora
        }
      },
      include: [
        {
          model: sequelize.models.Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        },
        {
          model: sequelize.models.Dispositivo,
          as: 'dispositivo',
          attributes: ['id', 'nombre', 'tipo'],
          required: false
        }
      ],
      order: [['fecha_prediccion', 'ASC']]
    });
  };

  // Métodos de instancia
  Prediccion.prototype.calcularError = function() {
    if (!this.consumo_real || !this.consumo_predicho) {
      return null;
    }
    
    return {
      absoluto: Math.abs(this.consumo_real - this.consumo_predicho),
      porcentual: Math.abs((this.consumo_real - this.consumo_predicho) / this.consumo_real) * 100,
      relativo: (this.consumo_predicho - this.consumo_real) / this.consumo_real * 100
    };
  };

  Prediccion.prototype.esPrecisa = function(umbralPrecision = 85) {
    return this.precision_calculada && this.precision_calculada >= umbralPrecision;
  };

  Prediccion.prototype.estaExpirada = function() {
    const ahora = new Date();
    const tiempoExpiracion = new Date(this.fecha_prediccion);
    
    // Las predicciones expiran según su tipo
    switch (this.tipo_prediccion) {
      case 'horaria':
        tiempoExpiracion.setHours(tiempoExpiracion.getHours() + 2);
        break;
      case 'diaria':
        tiempoExpiracion.setDate(tiempoExpiracion.getDate() + 1);
        break;
      case 'semanal':
        tiempoExpiracion.setDate(tiempoExpiracion.getDate() + 7);
        break;
      case 'mensual':
        tiempoExpiracion.setMonth(tiempoExpiracion.getMonth() + 1);
        break;
    }
    
    return ahora > tiempoExpiracion;
  };

  return Prediccion;
};
