const db = require('../../db/conexion');
const path = require('path');
const fs = require('fs');

function getYouTubeEmbedUrl(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

const MediaController = {

    // Método para listar todos los registros
    index: (req, res) => {
        db.all('SELECT * FROM Media WHERE activo = 1 ORDER BY orden', (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos de la base de datos');
            }
            res.render("admin/media/index", {
                media: results,
                mostrarAdmin: true,
                footerfijo: true
            });
        });
    },

    // Método para mostrar el formulario de creación
    create: async (req, res) => {
        try {
            const allIntegrantes = await new Promise((resolve, reject) => {
                db.all('SELECT id, nombre FROM Integrantes WHERE activo = 1 ORDER BY nombre', (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            const allTiposMedia = await new Promise((resolve, reject) => {
                db.all('SELECT id, nombre FROM TiposMedia ORDER BY nombre', (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            const mediaByIntegrante = await new Promise((resolve, reject) => {
                db.all('SELECT integranteId, tiposmediaId FROM Media WHERE activo = 1', (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            const tiposMediaMap = {};
            allTiposMedia.forEach(tipo => {
                tiposMediaMap[tipo.id] = tipo.nombre;
            });

            const integrantesFaltantes = [];
            const integrantesMap = {};

            allIntegrantes.forEach(integrante => {
                integrantesMap[integrante.id] = {
                    ...integrante,
                    tiposFaltantes: new Set(Object.values(tiposMediaMap))
                };
            });

            mediaByIntegrante.forEach(media => {
                if (integrantesMap[media.integranteId]) {
                    integrantesMap[media.integranteId].tiposFaltantes.delete(tiposMediaMap[media.tiposmediaId]);
                }
            });

            Object.values(integrantesMap).forEach(integrante => {
                if (integrante.tiposFaltantes.size > 0) {
                    integrantesFaltantes.push({
                        id: integrante.id,
                        nombre: integrante.nombre,
                        tiposFaltantes: Array.from(integrante.tiposFaltantes)
                    });
                }
            });

            res.render('admin/media/crearMedia', { 
                integrantes: integrantesFaltantes
            });
        } catch (error) {
            console.error('Error al obtener datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos');
        }
    },

    store: async (req, res) => {
        const { integranteId, tiposmediaId, url, orden } = req.body;
        const activo = req.body.activo ? 1 : 0;
        const file = req.file;

        if (!integranteId || !tiposmediaId) {
            req.flash('error', 'Los campos de ID de integrante y tipo de media son obligatorios.');
            return res.redirect('/admin/media/crear');
        }

        try {
            const integrante = await new Promise((resolve, reject) => {
                db.get(`SELECT nombre, apellido FROM Integrantes WHERE id = ?`, integranteId, (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (!integrante) {
                req.flash('error', 'Integrante no encontrado.');
                return res.redirect('/admin/media/crear');
            }

            const tipoMedia = await new Promise((resolve, reject) => {
                db.get(`SELECT id FROM TiposMedia WHERE nombre = ?`, tiposmediaId, (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (!tipoMedia) {
                req.flash('error', 'Tipo de media no encontrado.');
                return res.redirect('/admin/media/crear');
            }

            let finalUrl = url;
            if (tiposmediaId === 'youtube') {
                finalUrl = getYouTubeEmbedUrl(url);
                if (!finalUrl) {
                    req.flash('error', 'URL de YouTube no válida.');
                    return res.redirect('/admin/media/crear');
                }
            }

            const query = `INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden, activo) VALUES (?, ?, ?, ?, ?, ?)`;
            if (tiposmediaId === 'youtube') {
                db.run(query, [integranteId, tipoMedia.id, finalUrl, null, orden, activo], function(err) {
                    if (err) {
                        req.flash('error', 'Error al insertar en la base de datos. ' + err.message);
                        return res.redirect('/admin/media/crear');
                    }
                    req.flash('success', 'Media creada correctamente!');
                    res.redirect('/admin/media/listar');
                });
            } else {
                const newFileName = `${tipoMedia.id}-${integrante.nombre}-${integrante.apellido}-${Date.now()}${path.extname(file.originalname)}`;
                const newFilePath = path.join('public/images', newFileName);

                fs.rename(file.path, newFilePath, (err) => {
                    if (err) {
                        req.flash('error', 'Error al renombrar el archivo. ' + err.message);
                        return res.redirect('/admin/media/crear');
                    }

                    const nombrearchivo = `/images/${newFileName}`;

                    db.run(query, [integranteId, tipoMedia.id, finalUrl, nombrearchivo, orden, activo], function(err) {
                        if (err) {
                            req.flash('error', 'Error al insertar en la base de datos. ' + err.message);
                            return res.redirect('/admin/media/crear');
                        }
                        req.flash('success', 'Media creada correctamente!');
                        res.redirect('/admin/media/listar');
                    });
                });
            }
        } catch (error) {
            console.error('Error al realizar consultas:', error);
            req.flash('error', 'Error al realizar consultas. ' + error.message);
            res.redirect('/admin/media/crear');
        }
    },

    // Método para mostrar un registro
    // show: (req, res) => {
    //     const id = req.params.id;
    //     db.get('SELECT * FROM Media WHERE id = ?', [id], (err, row) => {
    //         if (err) {
    //             console.error('Error al obtener datos:', err);
    //             return res.status(500).send('Error al obtener datos de la base de datos');
    //         }
    //         res.render('admin/media/showMedia', {
    //             media: row,
    //             mostrarAdmin: true,
    //             footerfijo: true
    //         });
    //     });
    // },

    // Método para mostrar el formulario de edición
    // edit: (req, res) => {
    //     const id = req.params.id;
    //     db.get('SELECT * FROM Media WHERE id = ?', [id], (err, row) => {
    //         if (err) {
    //             console.error('Error al obtener datos:', err);
    //             return res.status(500).send('Error al obtener datos de la base de datos');
    //         }
    //         res.render('admin/media/editarMedia', {
    //             media: row,
    //             error: req.flash('error')
    //         });
    //     });
    // },

    // Método para editar un registro
    // update: (req, res) => {
    //     const { id, url, orden } = req.body;
    //     const activo = req.body.activo ? 1 : 0;

    //     if (!url || !orden) {
    //         req.flash('error', 'Todos los campos son obligatorios.');
    //         return res.redirect(`/admin/media/editar/${id}`);
    //     }

    //     const query = `UPDATE Media SET url = ?, activo = ?, orden = ? WHERE id = ?`;
    //     db.run(query, [url, activo, orden, id], function(err) {
    //         if (err) {
    //             req.flash('error', 'Error al actualizar en la base de datos.');
    //             return res.redirect(`/admin/media/editar/${id}`);
    //         }

    //         req.flash('success', 'Media actualizada correctamente!');
    //         res.redirect('/admin/media/listar');
    //     });
    // },

    // Método para eliminar un registro
    destroy: (req, res) => {
        const id = req.params.id;

        console.log('Eliminando registro con ID:', id);
        // Borrado lógico del registro
        const query = `UPDATE Media SET activo = 0 WHERE id = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error al eliminar el registro:', err);
                req.flash('error', 'Error al eliminar el registro.');
                return res.redirect('/admin/media/listar');
            }

            req.flash('success', 'Media eliminada correctamente!');
            res.redirect('/admin/media/listar');
        });
    }
};

module.exports = MediaController;
