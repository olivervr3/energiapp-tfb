const express = require('express');
const { body, validationResult } = require('express-validator');
const { Prediccion, Dispositivo } = require('../config/database');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /api/predicciones:
 *   get:
 *     summary: Obtener predicciones de consumo
 *     tags: [Predicciones]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      dispositivo_id, 
      tipo_prediccion = 'horaria',
      estado = 'pendiente',
      limit = 50 
    } = req.query;

    const whereConditions = {
      usuario_id: req.userId
    };

    if (dispositivo_id) {
      whereConditions.dispositivo_id = dispositivo_id;
    }

    if (tipo_prediccion) {
      whereConditions.tipo_prediccion = tipo_prediccion;
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    const predicciones = await Prediccion.findAll({
      where: whereConditions,
      include: [{
        model: Dispositivo,
        as: 'dispositivo',
        attributes: ['id', 'nombre', 'tipo'],
        required: false
      }],
      order: [['fecha_prediccion', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      predicciones,
      total: predicciones.length
    });
  } catch (error) {
    console.error('Error obteniendo predicciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/predicciones:
 *   post:
 *     summary: Crear nueva predicción
 *     tags: [Predicciones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, [
  body('fecha_prediccion')
    .isISO8601()
    .withMessage('La fecha de predicción debe estar en formato ISO 8601'),
  body('consumo_predicho')
    .isFloat({ min: 0 })
    .withMessage('El consumo predicho debe ser un número positivo'),
  body('modelo_utilizado')
    .notEmpty()
    .withMessage('El modelo utilizado es obligatorio')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    // Si se especifica dispositivo_id, verificar que pertenece al usuario
    if (req.body.dispositivo_id) {
      const dispositivo = await Dispositivo.findOne({
        where: {
          id: req.body.dispositivo_id,
          usuario_id: req.userId
        }
      });

      if (!dispositivo) {
        return res.status(404).json({
          error: 'Dispositivo no encontrado'
        });
      }
    }

    const prediccion = await Prediccion.create({
      ...req.body,
      usuario_id: req.userId,
      fecha_creacion: new Date()
    });

    res.status(201).json({
      mensaje: 'Predicción creada exitosamente',
      prediccion
    });
  } catch (error) {
    console.error('Error creando predicción:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/predicciones/{id}:
 *   put:
 *     summary: Actualizar predicción
 *     tags: [Predicciones]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const prediccion = await Prediccion.findOne({
      where: {
        id: req.params.id,
        usuario_id: req.userId
      }
    });

    if (!prediccion) {
      return res.status(404).json({
        error: 'Predicción no encontrada'
      });
    }

    await prediccion.update(req.body);

    res.json({
      mensaje: 'Predicción actualizada exitosamente',
      prediccion
    });
  } catch (error) {
    console.error('Error actualizando predicción:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/predicciones/generar:
 *   post:
 *     summary: Generar predicciones automáticas
 *     tags: [Predicciones]
 *     security:
 *       - bearerAuth: []
 */
router.post('/generar', auth, async (req, res) => {
  try {
    const { dispositivo_id, horas_adelante = 24 } = req.body;

    // Simular generación de predicciones
    const predicciones = [];
    const ahora = new Date();

    for (let i = 1; i <= horas_adelante; i++) {
      const fechaPrediccion = new Date(ahora.getTime() + i * 60 * 60 * 1000);
      
      // Generar un valor simulado basado en patrones típicos
      const hora = fechaPrediccion.getHours();
      let consumoBase = 0.5; // kWh base
      
      // Simular picos de consumo en horas típicas
      if (hora >= 7 && hora <= 9) consumoBase = 1.2; // Mañana
      if (hora >= 13 && hora <= 14) consumoBase = 0.8; // Mediodía
      if (hora >= 18 && hora <= 22) consumoBase = 1.5; // Noche
      
      // Añadir variabilidad
      const variacion = (Math.random() - 0.5) * 0.3;
      const consumoPredicho = Math.max(0.1, consumoBase + variacion);

      const prediccion = await Prediccion.create({
        usuario_id: req.userId,
        dispositivo_id: dispositivo_id || null,
        fecha_prediccion: fechaPrediccion,
        fecha_creacion: new Date(),
        tipo_prediccion: 'horaria',
        consumo_predicho: consumoPredicho.toFixed(4),
        modelo_utilizado: 'simulacion_basica',
        version_modelo: '1.0',
        confianza: 75 + Math.random() * 20, // 75-95% confianza
        parametros_modelo: {
          tipo: 'regresion_lineal',
          variables: ['hora_dia', 'dia_semana', 'historial_consumo']
        },
        variables_entrada: {
          hora_dia: hora,
          dia_semana: fechaPrediccion.getDay(),
          temperatura_estimada: 20 + Math.random() * 10
        }
      });

      predicciones.push(prediccion);
    }

    res.status(201).json({
      mensaje: `${predicciones.length} predicciones generadas exitosamente`,
      predicciones: predicciones.slice(0, 10), // Solo mostrar las primeras 10
      total_generadas: predicciones.length
    });
  } catch (error) {
    console.error('Error generando predicciones:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
