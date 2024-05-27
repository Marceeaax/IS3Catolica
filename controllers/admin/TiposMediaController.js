const db = require('../../db/conexion');

const TiposMediaController = {
    // Método para listar los tipos de media
    index: (req, res) => {
        db.all('SELECT * FROM TiposMedia ORDER BY orden', (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos de la base de datos');
            }
            res.render("admin/tiposmedia/index", {
                tiposMedia: results,
                mostrarAdmin: true,
                footerfijo: true
            });
        });
    },

    // Método para mostrar el formulario de creación
    create: (req, res) => {
        res.render('admin/tiposmedia/creartipomedia', {
            nombre: req.query.nombre || '',
            orden: req.query.orden || '',
            activo: req.query.activo === '1',
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    // Método para guardar en la base de datos
    store: (req, res) => {
        const { nombre, orden } = req.body;
        const activo = req.body.activo ? 1 : 0;

        if (!nombre || !orden) {
            req.flash('error', 'Todos los campos son obligatorios.');
            return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(nombre)}&orden=${encodeURIComponent(orden)}&activo=${activo}`);
        }

        const query = `INSERT INTO TiposMedia (nombre, activo, orden) VALUES (?, ?, ?)`;
        db.run(query, [nombre, activo, orden], function(err) {
            if (err) {
                req.flash('error', 'Error al insertar en la base de datos.');
                return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(nombre)}&orden=${encodeURIComponent(orden)}&activo=${activo}`);
            }

            req.flash('success', 'Tipo de media creado correctamente!');
            res.redirect('/admin/tiposmedia/listar');
        });
    },

    // Método para mostrar un registro
    // show: (req, res) => {
    //     const id = req.params.id;
    //     db.get('SELECT * FROM TiposMedia WHERE id = ?', [id], (err, row) => {
    //         if (err) {
    //             console.error('Error al obtener datos:', err);
    //             return res.status(500).send('Error al obtener datos de la base de datos');
    //         }
    //         res.render('admin/tiposmedia/showTiposMedia', {
    //             tipoMedia: row,
    //             mostrarAdmin: true,
    //             footerfijo: true
    //         });
    //     });
    // },

    // Método para mostrar el formulario de edición
    // edit: (req, res) => {
    //     const id = req.params.id;
    //     db.get('SELECT * FROM TiposMedia WHERE id = ?', [id], (err, row) => {
    //         if (err) {
    //             console.error('Error al obtener datos:', err);
    //             return res.status(500).send('Error al obtener datos de la base de datos');
    //         }
    //         res.render('admin/tiposmedia/editarTiposMedia', {
    //             tipoMedia: row,
    //             error: req.flash('error')
    //         });
    //     });
    // },

    // Método para editar un registro
    // update: (req, res) => {
    //     const { id, nombre, orden } = req.body;
    //     const activo = req.body.activo ? 1 : 0;

    //     if (!nombre || !orden) {
    //         req.flash('error', 'Todos los campos son obligatorios.');
    //         return res.redirect(`/admin/tiposmedia/editar/${id}`);
    //     }

    //     const query = `UPDATE TiposMedia SET nombre = ?, activo = ?, orden = ? WHERE id = ?`;
    //     db.run(query, [nombre, activo, orden, id], function(err) {
    //         if (err) {
    //             req.flash('error', 'Error al actualizar en la base de datos.');
    //             return res.redirect(`/admin/tiposmedia/editar/${id}`);
    //         }

    //         req.flash('success', 'Tipo de media actualizado correctamente!');
    //         res.redirect('/admin/tiposmedia/listar');
    //     });
    // },

    // Método para eliminar un registro
    // destroy: (req, res) => {
    //     const id = req.params.id;
    //     const query = 'DELETE FROM TiposMedia WHERE id = ?';
    //     db.run(query, [id], function(err) {
    //         if (err) {
    //             console.error('Error al eliminar registro:', err);
    //             return res.status(500).send('Error al eliminar registro de la base de datos');
    //         }
    //         req.flash('success', 'Tipo de media eliminado correctamente!');
    //         res.redirect('/admin/tiposmedia/listar');
    //     });
    // }
};

module.exports = TiposMediaController;
