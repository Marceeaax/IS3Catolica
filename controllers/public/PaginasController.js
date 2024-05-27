const db = require('../../db/conexion');
require('dotenv').config();

const info = {
    repo: process.env.GITLAB_REPO_URL,
    nombre: process.env.FULL_NAME,
    materia: process.env.SUBJECT_DETAILS
};

const PaginasController = {
    index: (req, res) => {
        db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
            if (err) {
                console.error('Error al obtener los integrantes:', err.message);
                return res.status(500).send('Error al obtener los integrantes');
            }
            res.render("index", { 
                integrantes: rows,
                info,
                mostrarAdmin: true,
                footerfijo: true
            });
        });
    },

    infoCurso: (req, res) => {
        db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
            if (err) {
                console.error('Error al obtener los integrantes:', err.message);
                return res.status(500).send('Error al obtener los integrantes');
            }
            res.render("info_curso", { 
                integrantes: rows,
                info,
                footerfijo: true
            });
        });
    },

    wordCloud: (req, res) => {
        db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, rows) => {
            if (err) {
                console.error('Error al obtener los integrantes:', err.message);
                return res.status(500).send('Error al obtener los integrantes');
            }
            res.render("wordcloud", { 
                integrantes: rows,
                info,
                footerfijo: true
            });
        });
    },

    integranteDetalles: (req, res, next) => {
        const matricula = req.params.matricula;

        db.all('SELECT * FROM Integrantes WHERE activo = 1', (err, allIntegrantes) => {
            if (err) {
                console.error('Error al obtener la lista de integrantes:', err.message);
                return res.status(500).send('Error al obtener la lista de integrantes');
            }

            db.get('SELECT * FROM Integrantes WHERE matricula = ?', matricula, (err, integrante) => {
                if (err) {
                    console.error('Error al obtener el integrante:', err.message);
                    return res.status(500).send('Error al obtener el integrante');
                }

                if (!integrante) {
                    return next({ status: 404 });
                }

                const queryMedia = `
                    SELECT tm.nombre AS tipo, m.url, m.nombrearchivo 
                    FROM Media m
                    JOIN TiposMedia tm ON m.tiposmediaId = tm.id
                    WHERE m.integranteId = ? AND m.activo = 1
                `;
                db.all(queryMedia, integrante.id, (err, medios) => {
                    if (err) {
                        console.error('Error al obtener los medios:', err.message);
                        return res.status(500).send('Error al obtener los medios');
                    }

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

                    db.get('SELECT * FROM Colores WHERE integranteId = ? AND activo = 1', integrante.id, (err, colores) => {
                        if (err) {
                            console.error('Error al obtener la configuración de colores:', err.message);
                            return res.status(500).send('Error al obtener la configuración de colores');
                        }

                        res.render('integrantes', {
                            integrantes: allIntegrantes,
                            integrante,
                            media,
                            info,
                            colores,
                            footerfijo: false
                        });
                    });
                });
            });
        });
    }
};

module.exports = PaginasController;
