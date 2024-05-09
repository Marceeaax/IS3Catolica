// database.js
const sqlite3 = require('sqlite3').verbose(); // Importa el módulo sqlite3 para trabajar con bases de datos SQLite
const path = require('path'); // Importa el módulo path para manejar rutas de archivos

// Define la ruta de la base de datos dentro del directorio actual, usando `basededatos.sqlite` como nombre del archivo
const dbPath = path.join(__dirname, 'basededatos.sqlite');

// Imprime la ruta completa de la base de datos en la consola para facilitar la depuración
console.log(dbPath);

// Crea una conexión a la base de datos en el archivo especificado
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // Si hay un error durante la conexión, imprime un mensaje de error en la consola
        console.error('Error al conectar con la base de datos:', err.message);
    } else {
        // Si la conexión se realiza correctamente, imprime un mensaje de éxito en la consola
        console.log('Conexión a la base de datos establecida.');
    }
});

// Exporta el objeto `db` para que esté disponible en otros módulos y archivos
module.exports = db;
