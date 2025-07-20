const express = require('express');
const { body, validationResult } = require('express-validator');
const { Dispositivo, Usuario } = require('../config/database');
const { auth } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * /api/dispositivos:
 *   get:
 *     summary: Obtener dispositivos del usuario
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 */
router.get('/', auth, async (req, res) => {
  try {
    const dispositivos = await Dispositivo.findAll({
      where: { 
        usuario_id: req.userId,
        activo: true 
      },
      order: [['created_at', 'DESC']]
    });

    res.json({
      dispositivos,
      total: dispositivos.length
    });
  } catch (error) {
    console.error('Error obteniendo dispositivos:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/dispositivos:
 *   post:
 *     summary: Crear nuevo dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('tipo')
    .notEmpty()
    .withMessage('El tipo de dispositivo es obligatorio'),
  body('potencia_nominal')
    .isFloat({ min: 0 })
    .withMessage('La potencia nominal debe ser un número positivo')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    const dispositivo = await Dispositivo.create({
      ...req.body,
      usuario_id: req.userId
    });

    res.status(201).json({
      mensaje: 'Dispositivo creado exitosamente',
      dispositivo
    });
  } catch (error) {
    console.error('Error creando dispositivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   get:
 *     summary: Obtener dispositivo por ID
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findOne({
      where: { 
        id: req.params.id,
        usuario_id: req.userId 
      }
    });

    if (!dispositivo) {
      return res.status(404).json({
        error: 'Dispositivo no encontrado'
      });
    }

    res.json(dispositivo);
  } catch (error) {
    console.error('Error obteniendo dispositivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   put:
 *     summary: Actualizar dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findOne({
      where: { 
        id: req.params.id,
        usuario_id: req.userId 
      }
    });

    if (!dispositivo) {
      return res.status(404).json({
        error: 'Dispositivo no encontrado'
      });
    }

    await dispositivo.update(req.body);

    res.json({
      mensaje: 'Dispositivo actualizado exitosamente',
      dispositivo
    });
  } catch (error) {
    console.error('Error actualizando dispositivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/dispositivos/{id}:
 *   delete:
 *     summary: Eliminar dispositivo
 *     tags: [Dispositivos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const dispositivo = await Dispositivo.findOne({
      where: { 
        id: req.params.id,
        usuario_id: req.userId 
      }
    });

    if (!dispositivo) {
      return res.status(404).json({
        error: 'Dispositivo no encontrado'
      });
    }

    await dispositivo.update({ activo: false });

    res.json({
      mensaje: 'Dispositivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando dispositivo:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
