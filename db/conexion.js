// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define el camino de la base de datos dentro de tu proyecto
const dbPath = path.join(__dirname, 'basededatos.sqlite');
console.log(dbPath);

// Crea la conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        console.log('Conexión a la base de datos establecida.');
    }
});

module.exports = db;
