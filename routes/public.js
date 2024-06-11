
const express = require('express');
const router = express.Router();
const PaginasController = require('../controllers/public/PaginasController');
const AutenticacionController = require('../controllers/public/AutenticacionController');

// Ruta para la página principal: muestra los integrantes activos
router.get("/", PaginasController.index);

// Ruta para la información del curso: también muestra los integrantes activos
router.get("/InfoCurso", PaginasController.infoCurso);

// Ruta para la página de Word Cloud, que también requiere un listado de los integrantes activos
router.get("/WordCloud", PaginasController.wordCloud);

// Ruta para obtener información de un integrante específico, usando su matrícula como parámetro
router.get('/integrantes/:matricula', PaginasController.integranteDetalles);

// Rutas para el login y logout
router.get('/login', AutenticacionController.showLogin);
router.post('/login', AutenticacionController.login);
router.get('/logout', AutenticacionController.logout);

// Ruta para el registro
router.get('/register', AutenticacionController.showRegister);
router.post('/register', AutenticacionController.register);

module.exports = router;
