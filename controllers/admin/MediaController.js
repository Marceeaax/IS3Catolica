const MediaModel = require('../../models/media.model');
const db = require('../../db/conexion');
const path = require('path');
const fs = require('fs');
const mediaSchema = require('../../validators/media/validatorsmedia.js');

async function getNextOrder(tableName) {
    return new Promise((resolve, reject) => {
        const query = `SELECT MAX(orden) as maxOrder FROM ${tableName}`;
        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.maxOrder ? row.maxOrder + 1 : 1);
            }
        });
    });
}

const MediaController = {
    index: async (req, res) => {
        try {
            const filters = {
                id: req.query.id,
                integrante: req.query.integrante,
                tipomedia: req.query.tipomedia,
                orden: req.query.orden
            };
            const media = await MediaModel.getAll(filters);
            res.render("admin/media/index", {
                media: media,
                mostrarAdmin: true,
                footerfijo: true
            });
        } catch (err) {
            console.error('Error al obtener datos:', err);
            res.status(500).send('Error al obtener datos de la base de datos');
        }
    },

    create: async (req, res) => {
        try {
            const allIntegrantes = await new Promise((resolve, reject) => {
                db.all('SELECT id, nombre FROM Integrantes WHERE activo = 1 ORDER BY nombre', (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            const allTiposMedia = await new Promise((resolve, reject) => {
                db.all('SELECT id, nombre FROM TiposMedia WHERE activo = 1 ORDER BY nombre', (err, rows) => {
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

            console.log('Integrantes faltantes:', integrantesFaltantes); // Mensaje de depuración

            res.render('admin/media/crearMedia', { 
                integrantes: integrantesFaltantes
            });
        } catch (error) {
            console.error('Error al obtener datos:', error);
            res.status(500).send('Error al obtener datos de la base de datos');
        }
    },

    store: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        console.log('Datos recibidos en store:', req.body); // Mensaje de depuración
        const { error, value } = mediaSchema.validate(req.body);
        if (error) {
            console.log('Error de validación:', error.details); // Mensaje de depuración
            req.flash('error', error.details[0].message);
            return res.redirect('/admin/media/crear');
        }

        let file = req.file;
        console.log('Archivo recibido:', file); // Mensaje de depuración

        console.log('URL:', value.url); // Mensaje de depuración
        
        // Verificar si es un enlace de YouTube y modificar los datos en consecuencia
        if (value.tiposmediaId == "youtube" && value.url) { // Assuming id 1 is for YouTube
            const youtubeUrl = getYouTubeEmbedUrl(value.url);
            if (!youtubeUrl) {
                req.flash('error', 'URL de YouTube no válida.');
                return res.redirect('/admin/media/crear');
            }
            value.url = youtubeUrl;
            file = null; // No hay archivo cuando se trata de un enlace de YouTube
        }

        try {
            await MediaModel.create(value, file);
            req.flash('success', 'Media creada correctamente!');
            res.redirect('/admin/media/listar');
        } catch (err) {
            console.error('Error al insertar en la base de datos:', err.message); // Mensaje de depuración
            req.flash('error', 'Error al insertar en la base de datos. ' + err.message);
            res.redirect('/admin/media/crear');
        }
    },

    edit: async (req, res) => {
        const id = req.params.id;

        try {
            const media = await MediaModel.getById(id);
            if (!media) {
                req.flash('error', 'Media no encontrada.');
                return res.redirect('/admin/media/listar');
            }

            res.render('admin/media/editarMedia', {
                media
            });
        } catch (error) {
            console.error('Error al obtener datos:', error);
            req.flash('error', 'Error al obtener datos de la base de datos.');
            res.redirect('/admin/media/listar');
        }
    },

    update: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        console.log('Datos recibidos en update:', req.body); // Mensaje de depuración
        const { error, value } = mediaSchema.validate(req.body);
        if (error) {
            console.log('Error de validación:', error.details); // Mensaje de depuración
            req.flash('error', error.details[0].message);
            return res.redirect(`/admin/media/${req.params.id}/editar`);
        }

        let file = req.file; // Este es el archivo nuevo si se proporciona
        console.log('Archivo recibido para actualización:', file); // Mensaje de depuración

        // Verificar si es un enlace de YouTube y modificar los datos en consecuencia
        if (value.tiposmediaId == 1 && value.url) { // Assuming id 1 is for YouTube
            const youtubeUrl = getYouTubeEmbedUrl(value.url);
            if (!youtubeUrl) {
                req.flash('error', 'URL de YouTube no válida.');
                return res.redirect(`/admin/media/${req.params.id}/editar`);
            }
            value.url = youtubeUrl;
            file = null; // No hay archivo cuando se trata de un enlace de YouTube
        }

        try {
            await MediaModel.update(req.params.id, value, file);
            req.flash('success', 'Media actualizada correctamente!');
            res.redirect('/admin/media/listar');
        } catch (err) {
            console.error('Error al actualizar en la base de datos:', err.message); // Mensaje de depuración
            req.flash('error', 'Error al actualizar en la base de datos. ' + err.message);
            res.redirect(`/admin/media/${req.params.id}/editar`);
        }
    },

    destroy: async (req, res) => {
        const id = req.params.id;

        try {
            await MediaModel.delete(id);
            req.flash('success', 'Media eliminada correctamente!');
            res.redirect('/admin/media/listar');
        } catch (err) {
            console.error('Error al eliminar el registro:', err);
            req.flash('error', 'Error al eliminar el registro.');
            res.redirect('/admin/media/listar');
        }
    }
};

// Función para obtener el URL embebido de YouTube
function getYouTubeEmbedUrl(url) {
    const regex = /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

module.exports = MediaController;
