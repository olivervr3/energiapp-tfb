// Archivo server.js en la raíz para Render
// Redirige al servidor backend real

console.log('🚀 Iniciando EnergiApp TFB...');
console.log('📁 Redirigiendo al servidor backend...');

// Cambiar al directorio backend y requerir el servidor real
process.chdir('./backend');
require('./server.js');
