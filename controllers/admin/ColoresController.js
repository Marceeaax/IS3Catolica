const db = require('../../db/conexion');

const ColoresController = {
    index: (req, res) => {
        db.all('SELECT * FROM Colores WHERE activo = 1', (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos de la base de datos');
            }
            res.render("admin/colores/index", {
                colores: results,
                mostrarAdmin: true,
                footerfijo: true
            });
        });
    },

    create: async (req, res) => {
        try {
            const integrantesSinColores = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT i.id, i.nombre
                    FROM Integrantes i
                    LEFT JOIN Colores c ON i.id = c.integranteId
                    WHERE c.integranteId IS NULL;
                `, (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
            });

            res.render('admin/colores/crearColores', {
                integrantes: integrantesSinColores,
                background: req.query.background || '',
                headerBackground: req.query.headerBackground || '',
                sectionBackground: req.query.sectionBackground || '',
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error al obtener integrantes sin colores:', error);
            req.flash('error', 'Error al obtener la lista de integrantes sin colores.');
            res.redirect('/ruta/de/error');
        }
    },

    store: (req, res) => {
        const { integranteId, background, headerBackground, sectionBackground } = req.body;

        if (!integranteId || !background || !headerBackground || !sectionBackground) {
            req.flash('error', 'Todos los campos son obligatorios.');
            return res.redirect(`/admin/colores/crear?integranteId=${encodeURIComponent(integranteId)}&background=${encodeURIComponent(background)}&headerBackground=${encodeURIComponent(headerBackground)}&sectionBackground=${encodeURIComponent(sectionBackground)}`);
        }

        const query = `INSERT INTO Colores (integranteId, background, headerBackground, sectionBackground) VALUES (?, ?, ?, ?)`;
        db.run(query, [integranteId, background, headerBackground, sectionBackground], function(err) {
            if (err) {
                req.flash('error', 'Error al insertar en la base de datos.');
                return res.redirect(`/admin/colores/crear?integranteId=${encodeURIComponent(integranteId)}&background=${encodeURIComponent(background)}&headerBackground=${encodeURIComponent(headerBackground)}&sectionBackground=${encodeURIComponent(sectionBackground)}`);
            }

            req.flash('success', 'Colores asignados correctamente!');
            res.redirect('/admin/colores/listar');
        });
    },

    edit: (req, res) => {
        const id = req.params.id;
        const query = `SELECT * FROM Colores WHERE integranteId = ?`;

        db.get(query, [id], (err, color) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                req.flash('error', 'Error al obtener los datos del registro.');
                return res.redirect('/admin/colores/listar');
            }

            res.render('admin/colores/editarColores', {
                color,
                success: req.flash('success')
            });
        });
    },

    update: (req, res) => {

        const activo = req.body.activo ? 1 : 0;
        const { id } = req.params;
        const { background, headerBackground, sectionBackground } = req.body;

        if (!background || !headerBackground || !sectionBackground) {
            req.flash('error', 'Todos los campos son obligatorios.');
            return res.redirect(`/admin/colores/${id}/editar`);
        }

        const query = `UPDATE Colores SET background = ?, headerBackground = ?, sectionBackground = ?, activo = ? WHERE integranteId = ?`;
        db.run(query, [background, headerBackground, sectionBackground, activo, id], function(err) {
            if (err) {
                req.flash('error', 'Error al actualizar en la base de datos.');
                return res.redirect(`/admin/colores/${id}/editar`);
            }

            req.flash('success', 'Colores actualizados correctamente!');
            res.redirect(`/admin/colores/listar`);
        });
    },
    
    destroy: (req, res) => {
        const id = req.params.id;

        // Borrado lógico del registro
        const query = `UPDATE Colores SET activo = 0 WHERE integranteId = ?`;
        db.run(query, [id], function(err) {
            if (err) {
                console.error('Error al eliminar el registro:', err);
                req.flash('error', 'Error al eliminar el registro.');
                return res.redirect('/admin/colores/listar');
            }

            req.flash('success', 'Color eliminado correctamente!');
            res.redirect('/admin/colores/listar');
        });
    }
};

module.exports = ColoresController;
