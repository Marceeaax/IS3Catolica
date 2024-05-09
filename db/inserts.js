// insertData.js
const fs = require('fs'); // Importa el módulo del sistema de archivos para leer archivos locales
const path = require('path'); // Importa el módulo de rutas para manejar rutas de archivos
const db = require('./conexion'); // Importa el módulo de conexión a la base de datos

// Define la ruta completa del archivo SQL que contiene las instrucciones de inserción
const sqlPath = path.join(__dirname, 'inserts.sql');

// Lee el contenido del archivo SQL como una cadena de texto
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Ejecuta el script SQL leído para insertar los datos en la base de datos
db.exec(sql, (err) => {
    if (err) {
        // Si hay un error durante la inserción, se muestra un mensaje en la consola
        console.error('Error al insertar los datos:', err.message);
    } else {
        // Si la inserción es exitosa, se muestra un mensaje de confirmación
        console.log('Datos insertados correctamente.');
    }
    
    // Cierra la conexión a la base de datos después de la operación
    db.close();
});
