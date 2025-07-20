const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { sequelize } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Importar rutas
const authRoutes = require('./routes/auth');
const dispositivosRoutes = require('./routes/dispositivos');
const consumoRoutes = require('./routes/consumo');
const prediccionesRoutes = require('./routes/predicciones');
const dashboardRoutes = require('./routes/dashboard');
const recomendacionesRoutes = require('./routes/recomendaciones');

const app = express();

// Middleware de seguridad
app.use(helmet());

// CORS (será manejado por el servidor principal)
// app.use(cors({
//   origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
//   credentials: true
// }));

// Rate limiting (será manejado por el servidor principal si es necesario)
// const limiter = rateLimit({
//   windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutos
//   max: process.env.RATE_LIMIT_MAX || 100, // límite de 100 peticiones por IP
//   message: {
//     error: 'Demasiadas peticiones desde esta IP, inténtalo de nuevo más tarde.'
//   }
// });
// app.use('/api/', limiter);

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - ${req.ip}`);
  next();
});

// Rutas de la API (sin prefijo /api ya que se añade en el servidor principal)
app.use('/auth', authRoutes);
app.use('/dispositivos', dispositivosRoutes);
app.use('/consumo', consumoRoutes);
app.use('/predicciones', prediccionesRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/recomendaciones', recomendacionesRoutes);

// Documentación Swagger
if (process.env.NODE_ENV !== 'production') {
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = require('./config/swagger');
  
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Energía Doméstica - Documentación'
  }));
}

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Ruta raíz del backend
app.get('/', (req, res) => {
  res.json({
    message: 'API de Plataforma de Energía Doméstica',
    version: '2.0.0',
    status: 'Backend middleware activo',
    docs: process.env.NODE_ENV !== 'production' ? '/api/docs' : null
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Manejar rutas no encontradas (comentado para uso como middleware)
// app.use('*', (req, res) => {
//   res.status(404).json({
//     error: 'Ruta no encontrada',
//     message: `No se pudo encontrar ${req.originalUrl} en este servidor`
//   });
// });

// Inicialización de base de datos
const initializeDatabase = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida correctamente');

    // Sincronizar modelos 
    // await sequelize.sync({ alter: true });
    logger.info('Modelos sincronizados con la base de datos');

  } catch (error) {
    logger.error('Error al conectar con la base de datos:', error);
    throw error;
  }
};

// Inicializar DB cuando se importa como middleware
initializeDatabase().catch(console.error);

const PORT = process.env.PORT || 3001;

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    logger.info('Conexión a la base de datos establecida correctamente');

    // Sincronizar modelos 
    // await sequelize.sync({ alter: true });
    logger.info('Modelos sincronizados con la base de datos');

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`Servidor ejecutándose en puerto ${PORT}`);
      if (process.env.NODE_ENV !== 'production') {
        logger.info(`Documentación disponible en http://localhost:${PORT}/api/docs`);
      }
    });

  } catch (error) {
    logger.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre del proceso
process.on('SIGTERM', async () => {
  logger.info('Recibida señal SIGTERM, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Recibida señal SIGINT, cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor si no está siendo importado
if (require.main === module) {
  startServer();
}

module.exports = app;
