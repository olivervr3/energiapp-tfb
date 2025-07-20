const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Usar la misma ruta que el backend: ./database.sqlite desde el directorio backend
const dbPath = './database.sqlite';
const db = new sqlite3.Database(dbPath);

console.log('Verificando base de datos del backend...');
console.log('Ruta:', path.resolve(dbPath));

db.all("SELECT email, role, activo, nombre, apellidos FROM usuarios", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log(`Usuarios encontrados: ${rows.length}`);
    rows.forEach(user => {
      console.log(`- ${user.email}: ${user.role || 'user'} (Activo: ${user.activo})`);
    });
  }
  
  db.close();
});
