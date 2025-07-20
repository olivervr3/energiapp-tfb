const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = '../database.sqlite'; // Desde backend hacia raíz
const db = new sqlite3.Database(dbPath);

console.log('Verificando usuarios en database.sqlite (raíz desde backend)...');
console.log('Ruta completa:', path.resolve(dbPath));

db.all("SELECT email, role, activo, nombre FROM usuarios", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(`Usuarios encontrados: ${rows.length}`);
    rows.forEach(user => {
      console.log(`- ${user.email}: ${user.role || 'user'} (Activo: ${user.activo}) - ${user.nombre}`);
    });
  }
  
  db.close();
});
