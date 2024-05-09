// insertData.js
const fs = require('fs');
const path = require('path');
const db = require('./conexion');

// Leer el archivo de inserción
const sqlPath = path.join(__dirname, 'inserts.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Ejecutar el script SQL para insertar los datos
db.exec(sql, (err) => {
    if (err) {
        console.error('Error al insertar los datos:', err.message);
    } else {
        console.log('Datos insertados correctamente.');
    }
    db.close();
});
