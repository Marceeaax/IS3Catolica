// createDatabase.js
const fs = require('fs');
const path = require('path');
const db = require('./conexion');

// Leer el archivo SQL
const sqlPath = path.join(__dirname, 'crebas.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Ejecutar el script SQL para crear las tablas
db.exec(sql, (err) => {
    if (err) {
        console.error('Error al crear las tablas:', err.message);
    } else {
        console.log('Tablas creadas exitosamente.');
    }
    db.close();
});
