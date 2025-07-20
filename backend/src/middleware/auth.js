const jwt = require('jsonwebtoken');
const { Usuario } = require('../config/database');

/**
 * Middleware de autenticación JWT
 * Verifica que el usuario esté autenticado y agregue su información a req
 */
const auth = async (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Acceso denegado. Token no proporcionado.'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    if (!token) {
      return res.status(401).json({
        error: 'Acceso denegado. Token no válido.'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario existe y está activo
    const usuario = await Usuario.findOne({
      where: {
        id: decoded.userId,
        activo: true
      },
      attributes: ['id', 'email', 'nombre', 'apellidos', 'activo']
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Acceso denegado. Usuario no válido.'
      });
    }

    // Agregar información del usuario a la request
    req.userId = usuario.id;
    req.userEmail = usuario.email;
    req.user = usuario;

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Token no válido.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado.'
      });
    }

    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({
      error: 'Error interno del servidor.'
    });
  }
};

/**
 * Middleware de autenticación opcional
 * Permite que la ruta funcione tanto con usuario autenticado como sin él
 */
const authOptional = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No hay token, continuar sin autenticación
      return next();
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const usuario = await Usuario.findOne({
        where: {
          id: decoded.userId,
          activo: true
        },
        attributes: ['id', 'email', 'nombre', 'apellidos', 'activo']
      });

      if (usuario) {
        req.userId = usuario.id;
        req.userEmail = usuario.email;
        req.user = usuario;
      }
    } catch (tokenError) {
      // Token inválido o expirado, continuar sin autenticación
      console.warn('Token inválido en authOptional:', tokenError.message);
    }

    next();

  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    // En caso de error, continuar sin autenticación
    next();
  }
};

module.exports = {
  auth,
  authOptional
};
