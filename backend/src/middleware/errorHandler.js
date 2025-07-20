const logger = require('../utils/logger');

/**
 * Middleware global para manejo de errores
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logger.error(err);

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(error => error.message).join(', ');
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de clave única de Sequelize
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Recurso duplicado. Este valor ya existe.';
    error = {
      message,
      statusCode: 409
    };
  }

  // Error de clave foránea de Sequelize
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    const message = 'Error de referencia. El recurso relacionado no existe.';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de conexión a la base de datos
  if (err.name === 'SequelizeConnectionError') {
    const message = 'Error de conexión con la base de datos';
    error = {
      message,
      statusCode: 503
    };
  }

  // Error de token JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token de acceso inválido';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de token JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token de acceso expirado';
    error = {
      message,
      statusCode: 401
    };
  }

  // Error de syntax JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    const message = 'Formato JSON inválido';
    error = {
      message,
      statusCode: 400
    };
  }

  // Error de Cast (normalmente MongoDB, pero puede aplicar)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = {
      message,
      statusCode: 404
    };
  }

  // Respuesta de error
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      originalError: err.name
    })
  });
};

/**
 * Middleware para capturar rutas no encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta ${req.originalUrl} no encontrada`);
  error.statusCode = 404;
  next(error);
};

/**
 * Wrapper para funciones async para capturar errores automáticamente
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Crear un error personalizado
 */
class CustomError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
  }
}

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  CustomError
};
