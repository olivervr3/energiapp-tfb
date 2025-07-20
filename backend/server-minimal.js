console.log('🎯 BACKEND MINIMAL - INICIO');
console.log('📍 CWD:', process.cwd());
console.log('📍 __dirname:', __dirname);

try {
  console.log('🔧 Importando Express...');
  const express = require('express');
  console.log('✅ Express importado correctamente');
  
  console.log('🔧 Creando app Express...');
  const app = express();
  console.log('✅ App Express creada');
  
  const PORT = process.env.PORT || 3001;
  console.log('🔧 Puerto:', PORT);
  
  // Ruta básica de prueba
  app.get('/', (req, res) => {
    res.json({ 
      message: 'EnergiApp Backend - Minimal Test',
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });
  
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      version: 'minimal-test',
      timestamp: new Date().toISOString()
    });
  });
  
  console.log('🚀 Iniciando servidor en puerto', PORT);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ SERVIDOR MINIMAL INICIADO CORRECTAMENTE');
    console.log(`🌐 URL: http://0.0.0.0:${PORT}`);
    console.log(`🩺 Health: http://0.0.0.0:${PORT}/api/health`);
  }).on('error', (error) => {
    console.error('❌ Error iniciando servidor:', error);
  });
  
} catch (error) {
  console.error('❌ ERROR FATAL EN BACKEND MINIMAL:', error);
  console.error('❌ Stack:', error.stack);
  process.exit(1);
}
