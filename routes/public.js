// routes/public.js
const express = require('express');
const router = express.Router();
const db = require('../db/data');

// Definir las rutas aquí
// Página principal
router.get("/", (request, response) => {
    response.render("index", { 
        integrantes: db.integrantes,
        footerfijo: true
    });
});

// Información de los integrantes
router.get("/Integrantes", (request, response) => {
    response.render("integrantes", { 
        integrantes: db.integrantes
    });
});

// Información del curso
router.get("/InfoCurso", (request, response) => {
    response.render("info_curso", { 
        integrantes: db.integrantes,
        footerfijo: true
    });
});

// Word Cloud
router.get("/WordCloud", (request, response) => {
    response.render("wordcloud", { 
        integrantes: db.integrantes,
        footerfijo: true
    });
});

// API para información de los integrantes según la matrícula
router.get('/integrantes/:matricula', (request, response) => {
    const matricula = request.params.matricula;
    const integrante = db.integrantes.find(i => i.matricula === matricula);
    const media = db.media[matricula];

    if (integrante && media) {
        response.render('integrantes', {
            integrante,
            media,
            footerfijo: false
        });
    } else {
        response.status(404).render('404', { error: 'Integrante no encontrado' });
    }
});

module.exports = router;
