const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Verificando estructura de la tabla usuarios...');

db.all("PRAGMA table_info(usuarios)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Columnas en la tabla usuarios:');
    rows.forEach(col => {
      console.log(`- ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
  }
  
  db.close();
});
