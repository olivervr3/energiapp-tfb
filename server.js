// Archivo server.js en la raíz para Render
// Redirige al servidor backend real

console.log('🚀 Iniciando EnergiApp TFB...');
console.log('📁 Redirigiendo al servidor backend...');

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
  // Cambiar al directorio backend y requerir el servidor real
  process.chdir('./backend');
  console.log('📂 Directorio cambiado a:', process.cwd());
  require('./server.js');
} catch (error) {
  console.error('❌ Error al iniciar el servidor backend:', error);
  process.exit(1);
}
