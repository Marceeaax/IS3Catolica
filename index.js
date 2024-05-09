// index.js
const express = require('express');
const hbs = require('hbs');
const publicRoutes = require('./routes/public'); // Importa las rutas
const db = require('./db/conexion');

// Aplicación express
const app = express();

// Importar el archivo .env
require('dotenv').config();

const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

/* Prueba para ver si se importa bien las variables de entorno */
//console.log('Información general:', info);


// Prueba para ver si la base de datos se importa correctamente
/*db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
    if (err) {
        console.error('Error al obtener los datos:', err.message);
    } else {
        console.log('Integrantes activos:', rows);
    }
});*/

// Configuración para motor de vistas hbs
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerPartials(__dirname + "/views/partials");

// Usa las rutas del archivo public.js
app.use(publicRoutes);

app.use((req, res, next) => {
    // Llamar al siguiente middleware con un error 404
    next({ status: 404 });
});

// Aquí contemplamos la renderización de la página de error 404 cuando no se puede encontrar una página solicitada
app.use((err, req, res, next) => {
    // Verificar si el error es 404
    if (err.status === 404) {
        const randomNumber = Math.round(Math.random());
        if (randomNumber === 0) {
            return res.status(404).render('error/index');
            
        } else {
            return res.status(404).render('error/index2');
        }
    }

    // Para otros errores, continuar con el manejo de errores
    next(err);
});

// Definir variable dinamica para el puerto (modificarlo en el .env)
const puerto = process.env.PORT;

// Corre el servidor en el puerto 3000
app.listen(puerto, () => {
    console.log("El servidor se está ejecutando en http://localhost:" + puerto);
});
