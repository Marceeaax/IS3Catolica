// routes/public.js
const express = require('express');
const router = express.Router();
const db = require('../db/conexion');

// Importar el archivo .env
require('dotenv').config();

const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

// Ruta para la página principal
router.get("/", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            response.render("index", { 
                integrantes: rows,
                info,
                footerfijo: true
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
                info,
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
                info,
                footerfijo: true
            });
        }
    });
});

// Ruta para información de un integrante según la matrícula
router.get('/integrantes/:matricula', (request, response) => {
    const matricula = request.params.matricula;

    // Consulta para obtener toda la lista de integrantes (para la navegación)
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
                    // Consulta para obtener los medios del integrante en categorías específicas
                    const queryMedia = `
                        SELECT tm.nombre AS tipo, m.url, m.nombrearchivo 
                        FROM Media m
                        JOIN TiposMedia tm ON m.tiposmediaId = tm.id
                        WHERE m.integranteId = ?
                    `;
                    db.all(queryMedia, integrante.id, (err, medios) => {
                        if (err) {
                            console.error('Error al obtener los medios:', err.message);
                            response.status(500).send('Error al obtener los medios');
                        } else {
                            // Organizar medios por tipo
                            const media = {
                                youtube: null,
                                imagen: null,
                                dibujo: null
                            };
                            for (const m of medios) {
                                if (m.tipo === 'youtube') {
                                    media.youtube = m.url;
                                } else if (m.tipo === 'imagen') {
                                    media.imagen = m.nombrearchivo;
                                } else if (m.tipo === 'dibujo') {
                                    media.dibujo = m.nombrearchivo;
                                }
                            }

                            // Consulta para obtener la configuración de colores del integrante
                            db.get('SELECT * FROM Colores WHERE integranteId = ?', integrante.id, (err, colores) => {
                                if (err) {
                                    console.error('Error al obtener la configuración de colores:', err.message);
                                    response.status(500).send('Error al obtener la configuración de colores');
                                } else {
                                    // Pasar toda la información necesaria a la vista
                                    response.render('integrantes', {
                                        integrantes: allIntegrantes, // Pasar la lista completa de integrantes
                                        integrante,                 // Información individual del integrante
                                        media,                      // Los diferentes tipos de medios
                                        colores,                    // Configuración de colores
                                        info,
                                        footerfijo: false
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});


module.exports = router;
