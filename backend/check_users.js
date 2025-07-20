const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Verificando usuarios en la base de datos...');

db.all("SELECT id, email, role, nombre, apellidos FROM usuarios", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Usuarios encontrados:');
    rows.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role || 'user'}`);
      console.log(`  Nombre: ${user.nombre} ${user.apellidos}`);
      console.log('');
    });
  }
  
  db.close();
});
