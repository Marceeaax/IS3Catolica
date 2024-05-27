// Rutas publicas, accesibles sin autenticación

const express = require('express');
const router = express.Router();
const PaginasController = require('../controllers/public/PaginasController');

// Ruta para la página principal: muestra los integrantes activos
router.get("/", PaginasController.index);

// Ruta para la información del curso: también muestra los integrantes activos
router.get("/InfoCurso", PaginasController.infoCurso);

// Ruta para la página de Word Cloud, que también requiere un listado de los integrantes activos
router.get("/WordCloud", PaginasController.wordCloud);

// Ruta para obtener información de un integrante específico, usando su matrícula como parámetro
router.get('/integrantes/:matricula', PaginasController.integranteDetalles);

module.exports = router;
