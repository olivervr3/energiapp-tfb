const express = require('express');
const { body, validationResult } = require('express-validator');
const { ConsumoEnergetico, Dispositivo } = require('../config/database');
const { auth } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /api/consumo:
 *   get:
 *     summary: Obtener consumo energético
 *     tags: [Consumo]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth, async (req, res) => {
  try {
    const { 
      dispositivo_id, 
      fecha_inicio, 
      fecha_fin, 
      periodo = 'dia',
      limit = 100 
    } = req.query;

    const whereConditions = {
      usuario_id: req.userId
    };

    if (dispositivo_id) {
      whereConditions.dispositivo_id = dispositivo_id;
    }

    if (fecha_inicio && fecha_fin) {
      whereConditions.timestamp = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
      };
    }

    const consumos = await ConsumoEnergetico.findAll({
      where: whereConditions,
      include: [{
        model: Dispositivo,
        as: 'dispositivo',
        attributes: ['id', 'nombre', 'tipo']
      }],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    // Calcular estadísticas básicas
    const totalConsumo = consumos.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    const costoTotal = consumos.reduce((sum, c) => sum + parseFloat(c.costo_estimado || 0), 0);

    res.json({
      consumos,
      estadisticas: {
        total_registros: consumos.length,
        consumo_total_kwh: totalConsumo.toFixed(4),
        costo_total: costoTotal.toFixed(2),
        periodo_consultado: periodo
      }
    });
  } catch (error) {
    console.error('Error obteniendo consumo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/consumo:
 *   post:
 *     summary: Registrar nuevo consumo
 *     tags: [Consumo]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, [
  body('dispositivo_id')
    .notEmpty()
    .withMessage('El ID del dispositivo es obligatorio'),
  body('consumo_kwh')
    .isFloat({ min: 0 })
    .withMessage('El consumo debe ser un número positivo'),
  body('timestamp')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe estar en formato ISO 8601')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    // Verificar que el dispositivo pertenece al usuario
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

    const consumo = await ConsumoEnergetico.create({
      ...req.body,
      usuario_id: req.userId,
      timestamp: req.body.timestamp || new Date()
    });

    res.status(201).json({
      mensaje: 'Consumo registrado exitosamente',
      consumo
    });
  } catch (error) {
    console.error('Error registrando consumo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/consumo/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de consumo
 *     tags: [Consumo]
 *     security:
 *       - bearerAuth: []
 */
router.get('/estadisticas', auth, async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
    
    let fechaInicio;
    const ahora = new Date();
    
    switch (periodo) {
      case 'dia':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        break;
      case 'semana':
        fechaInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
        break;
      case 'año':
        fechaInicio = new Date(ahora.getFullYear(), 0, 1);
        break;
      default:
        fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    }

    const consumos = await ConsumoEnergetico.findAll({
      where: {
        usuario_id: req.userId,
        timestamp: {
          [Op.gte]: fechaInicio
        }
      },
      include: [{
        model: Dispositivo,
        as: 'dispositivo',
        attributes: ['nombre', 'tipo']
      }]
    });

    const totalConsumo = consumos.reduce((sum, c) => sum + parseFloat(c.consumo_kwh), 0);
    const costoTotal = consumos.reduce((sum, c) => sum + parseFloat(c.costo_estimado || 0), 0);

    // Agrupar por dispositivo
    const consumoPorDispositivo = {};
    consumos.forEach(c => {
      const nombre = c.dispositivo?.nombre || 'Sin nombre';
      if (!consumoPorDispositivo[nombre]) {
        consumoPorDispositivo[nombre] = 0;
      }
      consumoPorDispositivo[nombre] += parseFloat(c.consumo_kwh);
    });

    res.json({
      periodo,
      fecha_inicio: fechaInicio,
      fecha_fin: ahora,
      total_registros: consumos.length,
      consumo_total_kwh: totalConsumo.toFixed(4),
      costo_total: costoTotal.toFixed(2),
      consumo_promedio_kwh: consumos.length > 0 ? (totalConsumo / consumos.length).toFixed(4) : 0,
      consumo_por_dispositivo: consumoPorDispositivo
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
