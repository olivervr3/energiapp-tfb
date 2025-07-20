// Archivo server.js en la raíz para Render
// Ejecuta directamente el servidor backend simplificado

console.log('🚀 Iniciando EnergiApp TFB...');
console.log('📁 Cargando servidor backend simplificado...');

// Asegurar que el puerto esté configurado para Render
process.env.PORT = process.env.PORT || 10000;
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

console.log(`🔧 Configuración: PORT=${process.env.PORT}, NODE_ENV=${process.env.NODE_ENV}`);

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada:', reason);
  process.exit(1);
});

try {
  console.log(' Cargando servidor backend simplificado...');
  require('./backend/server-simple');
} catch (error) {
  console.error('❌ Error al iniciar el servidor backend:', error);
  console.error('❌ Stack trace:', error.stack);
  process.exit(1);
}
