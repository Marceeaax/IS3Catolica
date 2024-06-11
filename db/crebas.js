const fs = require('fs');
const path = require('path');
const db = require('./conexion');

// Define la ruta completa del archivo SQL que contiene las instrucciones de creación de la base de datos
const sqlPath = path.join(__dirname, 'crebas.sql');

// Lee el contenido del archivo SQL como una cadena de texto
const sql = fs.readFileSync(sqlPath, 'utf-8');

// Ejecuta el contenido del archivo SQL para crear las tablas en la base de datos
db.exec(sql, (err) => {
    if (err) {
        // Si hay un error durante la creación, se muestra un mensaje en la consola
        console.error('Error al crear las tablas:', err.message);
    } else {
        // Si las tablas se crean correctamente, se muestra un mensaje de confirmación
        console.log('Tablas creadas exitosamente.');
    }
    
    // Cierra la conexión a la base de datos para evitar fugas de recursos
    db.close();
});
