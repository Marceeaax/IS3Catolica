// index.js
const express = require('express');
const session = require('express-session');
const hbs = require('hbs');
const flash = require('connect-flash');
const dotenv = require('dotenv');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Define un objeto `info` para almacenar variables de entorno importantes
const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

// Crea una nueva instancia de la aplicación Express
const app = express();
app.use(express.urlencoded({ extended: true }));

// Configuración del motor de vistas hbs y la carpeta de vistas
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
hbs.registerPartials(__dirname + '/views/partials');

// Registro de helpers de Handlebars
hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

// Configura la sesión
app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret', // Reemplaza 'default_secret' con una clave secreta real
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware para pasar variables de sesión a todas las vistas
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Middleware para eliminar mensajes de sesión después de ser enviados
app.use((req, res, next) => {
    res.on('finish', () => {
        if (req.session && req.session.message) {
            delete req.session.message;
        }
    });
    next();
});

// Asegúrate de configurar esto después de haber inicializado express-session
app.use(flash());

// Configura un middleware para pasar mensajes flash a todas las vistas
app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.username = req.session.username || null;
    next();
});

// Sirve archivos estáticos desde la carpeta `public`
app.use(express.static('public'));

// Usa las rutas importadas
app.use(publicRoutes);
app.use('/admin', adminRoutes);

// Middleware para manejar errores 404 (Página no encontrada)
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
