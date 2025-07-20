const express = require('express');
const { sequelize } = require('../backend/src/config/database');
const router = express.Router();

// Health check con verificación de base de datos
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    
    // Verificar que existen usuarios
    const [results] = await sequelize.query("SELECT COUNT(*) as count FROM usuarios");
    const userCount = results[0].count;
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      database: {
        connected: true,
        users: userCount
      },
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: {
        connected: false
      }
    });
  }
});

module.exports = router;
