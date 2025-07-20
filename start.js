// Archivo de inicio para producción en Render
// Redirige al servidor backend

console.log('Iniciando EnergiApp TFB desde la raíz...');
console.log('Redirigiendo al servidor backend...');

// Cambiar al directorio backend y ejecutar el servidor
process.chdir('./backend');
require('./server.js');
