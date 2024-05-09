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
    gitlabRepo: process.env.GITLAB_REPO_URL,
    fullName: process.env.FULL_NAME,
    subjectDetails: process.env.SUBJECT_DETAILS
};

// SECCION BASE DE DATOS
// Ejemplo: Consulta de todos los integrantes
db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
    if (err) {
        console.error('Error al obtener los datos:', err.message);
    } else {
        console.log('Integrantes activos:', rows);
    }
});

// Configuración para motor de vistas hbs
app.use(express.static('public'));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerPartials(__dirname + "/views/partials");

// Usa las rutas del archivo public.js
app.use(publicRoutes);

// Aquí contemplamos la renderización de la página de error 404 cuando no se puede encontrar una página solicitada
app.use((req, res, next) => {
    var randomNumber = Math.round(Math.random());
    if (randomNumber === 0) {
        res.status(404).render('error/index');
    }
    else {
        res.status(404).render('error/index2');
    }
});

// Definir variable dinamica para el puerto (modificarlo en el .env)
const puerto = process.env.PORT;

// Corre el servidor en el puerto 3000
app.listen(puerto, () => {
    console.log("El servidor se está ejecutando en http://localhost:" + puerto);
});
