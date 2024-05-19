// routes/public.js
const express = require('express'); // Importa el framework Express
const router = express.Router(); // Crea un nuevo router para manejar las rutas públicas
const db = require('../db/conexion'); // Importa el módulo de conexión a la base de datos


// Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// Define un objeto `info` con las variables de entorno importantes para las vistas
const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

// Ruta para la página principal: muestra los integrantes activos
router.get("/", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            // Error al obtener los datos de los integrantes
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            // Renderiza la página principal con la lista de integrantes activos y la información general
            response.render("index", { 
                integrantes: rows,
                info,
                mostrarAdmin: true,
                footerfijo: true // Muestra un footer fijo
            });
        }
    });
});

// Ruta para la información del curso: también muestra los integrantes activos
router.get("/InfoCurso", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            // Error al obtener los datos de los integrantes
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            // Renderiza la página de información del curso con la lista de integrantes activos y la información general
            response.render("info_curso", { 
                integrantes: rows,
                info,
                footerfijo: true // Muestra un footer fijo
            });
        }
    });
});

// Ruta para la página de Word Cloud, que también requiere un listado de los integrantes activos
router.get("/WordCloud", (request, response) => {
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
        if (err) {
            // Error al obtener los datos de los integrantes
            console.error('Error al obtener los integrantes:', err.message);
            response.status(500).send('Error al obtener los integrantes');
        } else {
            // Renderiza la página Word Cloud con la lista de integrantes activos y la información general
            response.render("wordcloud", { 
                integrantes: rows,
                info,
                footerfijo: true // Muestra un footer fijo
            });
        }
    });
});

// Ruta para obtener información de un integrante específico, usando su matrícula como parámetro
router.get('/integrantes/:matricula', (request, response, next) => {
    const matricula = request.params.matricula;

    // Consulta para obtener toda la lista de integrantes activos
    db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, allIntegrantes) => {
        if (err) {
            console.error('Error al obtener la lista de integrantes:', err.message);
            return response.status(500).send('Error al obtener la lista de integrantes');
        }

        // Consulta para obtener la información de un integrante específico
        db.get('SELECT * FROM Integrantes WHERE matricula = ?', matricula, (err, integrante) => {
            if (err) {
                console.error('Error al obtener el integrante:', err.message);
                return response.status(500).send('Error al obtener el integrante');
            }

            // Verifica si se encontró el integrante; de lo contrario, se retorna un error 404
            if (!integrante) {
                return next({ status: 404 }); // Llamar al middleware de error si no se encuentra el integrante
            }

            // Consulta para obtener los medios asociados al integrante específico
            const queryMedia = `
                SELECT tm.nombre AS tipo, m.url, m.nombrearchivo 
                FROM Media m
                JOIN TiposMedia tm ON m.tiposmediaId = tm.id
                WHERE m.integranteId = ?
            `;
            db.all(queryMedia, integrante.id, (err, medios) => {
                if (err) {
                    console.error('Error al obtener los medios:', err.message);
                    return response.status(500).send('Error al obtener los medios');
                }

                // Organiza los medios por tipo
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
                        return response.status(500).send('Error al obtener la configuración de colores');
                    }
                    
                    // Renderiza la vista de detalles del integrante, incluyendo toda la información relevante
                    response.render('integrantes', {
                        integrantes: allIntegrantes, // Lista completa de integrantes activos
                        integrante, // Información del integrante específico
                        media, // Medios asociados
                        info,
                        colores, // Configuración de colores
                        footerfijo: false // No muestra un footer fijo
                    });
                });
            });
        });
    });
});

// Exporta el router para que pueda ser utilizado en otros archivos
module.exports = router;
