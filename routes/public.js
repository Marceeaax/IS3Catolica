// routes/public.js
const express = require('express');
const router = express.Router();
const db = require('../db/conexion');

// Ruta para la página principal
router.get("/", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            response.render("index", { 
                integrantes: rows,
                footerfijo: true
            });
        }
    });
});

// Ruta para la información de los integrantes
router.get("/Integrantes", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            response.render("integrantes", { 
                integrantes: rows
            });
        }
    });
});

// Información del curso (si los integrantes son necesarios)
router.get("/InfoCurso", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            response.render("info_curso", { 
                integrantes: rows,
                footerfijo: true
            });
        }
    });
});

// Word Cloud (suponiendo que también requiere un listado de integrantes)
router.get("/WordCloud", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            response.render("wordcloud", { 
                integrantes: rows,
                footerfijo: true
            });
        }
    });
});

// API para información de un integrante según la matrícula
router.get('/integrantes/:matricula', (request, response) => {
    const matricula = request.params.matricula;

    // Consulta para obtener toda la lista de integrantes
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, allIntegrantes) => {
        if (err) {
            console.error('Error al obtener la lista de integrantes:', err.message);
            response.status(500).send('Error al obtener la lista de integrantes');
        } else {
            // Consulta para obtener la información del integrante específico
            db.get('SELECT * FROM Integrantes WHERE matricula = ?', matricula, (err, integrante) => {
                if (err) {
                    console.error('Error al obtener el integrante:', err.message);
                    response.status(500).send('Error al obtener el integrante');
                } else if (!integrante) {
                    response.status(404).render('404', { error: 'Integrante no encontrado' });
                } else {
                    // Consulta para obtener los medios del integrante
                    db.get('SELECT * FROM Media WHERE integranteId = ?', integrante.id, (err, media) => {
                        if (err) {
                            console.error('Error al obtener el medio:', err.message);
                            response.status(500).send('Error al obtener el medio');
                        } else {
                            console.log('Integrante:', integrante);
                            response.render('integrantes', {
                                integrantes: allIntegrantes, // Pasar la lista completa de integrantes
                                integrante,                 // Información individual del integrante
                                media,
                                footerfijo: false
                            });
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;
