const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define la ruta de la base de datos para 'usuarios.sqlite'
const dbUsuariosPath = path.join(__dirname, 'usuarios.sqlite');

// Imprime la ruta completa de la base de datos en la consola para facilitar la depuración
console.log('DB Usuarios Path:', dbUsuariosPath);

// Crea una conexión a la base de datos 'usuarios.sqlite'
const dbUsuarios = new sqlite3.Database(dbUsuariosPath, (err) => {
    if (err) {
        // Si hay un error durante la conexión, imprime un mensaje de error en la consola
        console.error('Error al conectar con la base de datos de usuarios:', err.message);
    } else {
        // Si la conexión se realiza correctamente, imprime un mensaje de éxito en la consola
        console.log('Conexión a la base de datos de usuarios establecida.');

        // Crea la tabla de usuarios si no existe
        dbUsuarios.run(`CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla de usuarios:', err.message);
            } else {
                console.log("Tabla 'usuarios' creada o ya existe.");
            }
        });
    }
});

// Exporta el objeto `dbUsuarios` para que esté disponible en otros módulos y archivos
module.exports = dbUsuarios;
