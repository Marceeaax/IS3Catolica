// index.js
const express = require('express'); // Importa el framework Express
const hbs = require('hbs'); // Importa Handlebars como motor de plantillas
const publicRoutes = require('./routes/public'); // Importa las rutas públicas definidas en public.js
const db = require('./db/conexion'); // Importa el módulo de conexión a la base de datos

// Crea una nueva instancia de la aplicación Express
const app = express();

// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Define un objeto `info` para almacenar variables de entorno importantes
const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

// Descomentar esta línea para verificar la importación correcta de variables de entorno
// console.log('Información general:', info);

// Descomentar para verificar la correcta conexión a la base de datos y el acceso a los datos
/*
db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
    if (err) {
        console.error('Error al obtener los datos:', err.message);
    } else {
        console.log('Integrantes activos:', rows);
    }
});
*/

// Configuración del motor de vistas hbs y la carpeta de vistas
app.use(express.static('public')); // Sirve archivos estáticos desde la carpeta `public`
app.set('view engine', 'hbs'); // Establece hbs como el motor de vistas
app.set('views', __dirname + '/views'); // Configura la ubicación de la carpeta de vistas
hbs.registerPartials(__dirname + '/views/partials'); // Registra los parciales para Handlebars

// Usa las rutas públicas importadas
app.use(publicRoutes);

// Middleware para manejar errores 404 (Página no encontrada)
/*Los middlewares son códigos que se ejecutan antes de que una petición HTTP
 llegue al manejador de rutas o antes de que un cliente reciba una respuesta, 
 lo que da al framework la capacidad de ejecutar un script típico antes o después de la 
 petición de un cliente*/
 
app.use((req, res, next) => {
    next({ status: 404 }); // Llama al siguiente middleware con un error 404
});

// Middleware para gestionar errores y renderizar una página de error adecuada
app.use((err, req, res, next) => {
    // Verificar si el error es 404 y renderizar una página de error específica
    if (err.status === 404) {
        const randomNumber = Math.round(Math.random()); // Genera un número aleatorio (0 o 1)
        
        // Selecciona entre dos plantillas de error 404 de forma aleatoria
        if (randomNumber === 0) {
            return res.status(404).render('error/index');
        } else {
            return res.status(404).render('error/index2');
        }
    }

    // Para otros errores, continuar con el siguiente middleware
    next(err);
});

// Obtiene el puerto del archivo .env o establece un valor predeterminado
const puerto = process.env.PORT || 3000;

// Inicia el servidor y escucha en el puerto especificado
app.listen(puerto, () => {
    console.log(`El servidor se está ejecutando en http://localhost:${puerto}`);
});
