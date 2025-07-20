const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Usuario, sequelize } = require('../config/database');
const { auth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting para autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por IP
  message: {
    error: 'Demasiados intentos de login. Inténtalo de nuevo en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       required:
 *         - nombre
 *         - apellidos
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único del usuario
 *         nombre:
 *           type: string
 *           description: Nombre del usuario
 *         apellidos:
 *           type: string
 *           description: Apellidos del usuario
 *         email:
 *           type: string
 *           format: email
 *           description: Email del usuario
 *         telefono:
 *           type: string
 *           description: Teléfono del usuario
 *         direccion:
 *           type: string
 *           description: Dirección del usuario
 *         tipo_vivienda:
 *           type: string
 *           enum: [piso, casa, apartamento, duplex, otro]
 *         metros_cuadrados:
 *           type: integer
 *           description: Metros cuadrados de la vivienda
 *         num_habitantes:
 *           type: integer
 *           description: Número de habitantes
 */

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellidos
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               telefono:
 *                 type: string
 *               tipo_vivienda:
 *                 type: string
 *               metros_cuadrados:
 *                 type: integer
 *               num_habitantes:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El email ya está registrado
 */
router.post('/registro', [
  body('nombre')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('apellidos')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('telefono')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('metros_cuadrados')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Los metros cuadrados deben estar entre 1 y 10000'),
  body('num_habitantes')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('El número de habitantes debe estar entre 1 y 20')
], async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    const {
      nombre, apellidos, email, password, telefono,
      direccion, ciudad, codigo_postal, tipo_vivienda,
      metros_cuadrados, num_habitantes, tarifa_electrica
    } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(409).json({
        error: 'El email ya está registrado'
      });
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear el usuario
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      email: email.toLowerCase(),
      password: passwordHash,
      telefono,
      direccion,
      ciudad,
      codigo_postal,
      tipo_vivienda: tipo_vivienda || 'piso',
      metros_cuadrados,
      num_habitantes: num_habitantes || 1,
      tarifa_electrica
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: nuevoUsuario.id,
        email: nuevoUsuario.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellidos: nuevoUsuario.apellidos,
        email: nuevoUsuario.email,
        tipo_vivienda: nuevoUsuario.tipo_vivienda,
        metros_cuadrados: nuevoUsuario.metros_cuadrados,
        num_habitantes: nuevoUsuario.num_habitantes
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe proporcionar un email válido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
], async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    const { email, password } = req.body;
    console.log(`Login attempt for email: ${email}`);
    console.log('Database path:', sequelize.config.storage);
    console.log('Working directory:', process.cwd());

    // Buscar usuario por email (usando consulta SQL directa para debug)
    const usuarios = await sequelize.query(`
      SELECT * FROM usuarios WHERE email = ?
    `, {
      replacements: [email.toLowerCase()],
      type: sequelize.QueryTypes.SELECT
    });
    
    const usuario = usuarios[0];
    console.log('Resultado de consulta SQL directa:', usuario ? 'ENCONTRADO' : 'NO ENCONTRADO');
    if (usuario) {
      console.log('Email:', usuario.email, 'Activo:', usuario.activo, 'Role:', usuario.role);
    }

    console.log(`Usuario encontrado: ${usuario ? 'Sí' : 'No'}`);
    if (usuario) {
      console.log(`Usuario ID: ${usuario.id}, Email: ${usuario.email}, Role: ${usuario.role || 'undefined'}`);
    }

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const esPasswordValida = await bcrypt.compare(password, usuario.password);
    console.log(`Password válida: ${esPasswordValida}`);
    if (!esPasswordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas'
      });
    }

    // Actualizar último acceso usando SQL directo
    await sequelize.query(`
      UPDATE usuarios SET ultimo_acceso = ? WHERE id = ?
    `, {
      replacements: [new Date().toISOString(), usuario.id],
      type: sequelize.QueryTypes.UPDATE
    });

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        role: usuario.role,  // ¡Campo role agregado!
        tipo_vivienda: usuario.tipo_vivienda,
        metros_cuadrados: usuario.metros_cuadrados,
        num_habitantes: usuario.num_habitantes,
        ultimo_acceso: new Date().toISOString(),
        preferencias: typeof usuario.preferencias === 'string' 
          ? JSON.parse(usuario.preferencias) 
          : usuario.preferencias
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/perfil:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       401:
 *         description: No autorizado
 */
router.get('/perfil', auth, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      usuario
    });

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/perfil:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               tipo_vivienda:
 *                 type: string
 *               metros_cuadrados:
 *                 type: integer
 *               num_habitantes:
 *                 type: integer
 *               tarifa_electrica:
 *                 type: number
 *               objetivo_ahorro:
 *                 type: integer
 *               preferencias:
 *                 type: object
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       400:
 *         description: Error de validación
 */
router.put('/perfil', auth, [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('apellidos')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres'),
  body('telefono')
    .optional()
    .matches(/^[+]?[\d\s\-\(\)]+$/)
    .withMessage('Formato de teléfono inválido'),
  body('metros_cuadrados')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Los metros cuadrados deben estar entre 1 y 10000'),
  body('num_habitantes')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('El número de habitantes debe estar entre 1 y 20'),
  body('tarifa_electrica')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La tarifa eléctrica debe ser un número positivo'),
  body('objetivo_ahorro')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('El objetivo de ahorro debe estar entre 0 y 100')
], async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    const usuario = await Usuario.findByPk(req.userId);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Actualizar campos permitidos
    const camposPermitidos = [
      'nombre', 'apellidos', 'telefono', 'direccion', 'ciudad',
      'codigo_postal', 'tipo_vivienda', 'metros_cuadrados',
      'num_habitantes', 'tarifa_electrica', 'objetivo_ahorro', 'preferencias'
    ];

    const actualizaciones = {};
    camposPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
      }
    });

    await usuario.update(actualizaciones);

    res.json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        ciudad: usuario.ciudad,
        tipo_vivienda: usuario.tipo_vivienda,
        metros_cuadrados: usuario.metros_cuadrados,
        num_habitantes: usuario.num_habitantes,
        tarifa_electrica: usuario.tarifa_electrica,
        objetivo_ahorro: usuario.objetivo_ahorro,
        preferencias: usuario.preferencias
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/cambiar-password:
 *   put:
 *     summary: Cambiar contraseña del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - passwordActual
 *               - passwordNueva
 *             properties:
 *               passwordActual:
 *                 type: string
 *               passwordNueva:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Error de validación
 *       401:
 *         description: Contraseña actual incorrecta
 */
router.put('/cambiar-password', auth, [
  body('passwordActual')
    .notEmpty()
    .withMessage('La contraseña actual es obligatoria'),
  body('passwordNueva')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La nueva contraseña debe contener al menos una mayúscula, una minúscula y un número')
], async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        detalles: errors.array()
      });
    }

    const { passwordActual, passwordNueva } = req.body;

    const usuario = await Usuario.scope('withPassword').findByPk(req.userId);
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    // Verificar contraseña actual
    const esPasswordValida = await bcrypt.compare(passwordActual, usuario.password);
    if (!esPasswordValida) {
      return res.status(401).json({
        error: 'La contraseña actual es incorrecta'
      });
    }

    // Hashear nueva contraseña
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(passwordNueva, salt);

    // Actualizar contraseña
    await usuario.update({ password: passwordHash });

    res.json({
      mensaje: 'Contraseña cambiada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/Usuario'
 */
router.get('/profile', auth, async (req, res) => {
  try {
    // Usar consulta SQL directa para obtener el usuario
    const usuarios = await sequelize.query(`
      SELECT id, nombre, apellidos, email, role, telefono, direccion, ciudad, 
             codigo_postal, pais, tipo_vivienda, metros_cuadrados, num_habitantes,
             tarifa_electrica, objetivo_ahorro, avatar, activo, ultimo_acceso,
             preferencias, created_at, updated_at
      FROM usuarios WHERE id = ?
    `, {
      replacements: [req.user.id],
      type: sequelize.QueryTypes.SELECT
    });

    const usuario = usuarios[0];
    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    res.json({
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        email: usuario.email,
        role: usuario.role,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        ciudad: usuario.ciudad,
        codigo_postal: usuario.codigo_postal,
        pais: usuario.pais,
        tipo_vivienda: usuario.tipo_vivienda,
        metros_cuadrados: usuario.metros_cuadrados,
        num_habitantes: usuario.num_habitantes,
        tarifa_electrica: usuario.tarifa_electrica,
        objetivo_ahorro: usuario.objetivo_ahorro,
        avatar: usuario.avatar,
        activo: !!usuario.activo,
        ultimo_acceso: usuario.ultimo_acceso,
        preferencias: typeof usuario.preferencias === 'string' 
          ? JSON.parse(usuario.preferencias) 
          : usuario.preferencias,
        createdAt: usuario.created_at,
        updatedAt: usuario.updated_at
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 */
router.post('/logout', auth, async (req, res) => {
  try {
    res.json({
      mensaje: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
