const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Verificando detalles del usuario admin...');

db.get("SELECT * FROM usuarios WHERE email = 'admin@energiapp.com'", (err, row) => {
  if (err) {
    console.error('Error:', err);
  } else if (row) {
    console.log('Usuario admin encontrado:');
    console.log(`- ID: ${row.id}`);
    console.log(`- Email: ${row.email}`);
    console.log(`- Role: ${row.role}`);
    console.log(`- Activo: ${row.activo} (tipo: ${typeof row.activo})`);
    console.log(`- Nombre: ${row.nombre} ${row.apellidos}`);
    console.log(`- Password hash: ${row.password ? row.password.substring(0, 20) + '...' : 'NULL'}`);
  } else {
    console.log('Usuario admin NO encontrado');
  }
  
  db.close();
});
