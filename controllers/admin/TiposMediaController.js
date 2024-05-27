const db = require('../../db/conexion');

async function getNextOrder(tableName) {
    return new Promise((resolve, reject) => {
        const query = `SELECT MAX(orden) as maxOrder FROM ${tableName}`;
        db.get(query, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.maxOrder ? row.maxOrder + 1 : 1); // Si no hay registros, empezamos desde 1
            }
        });
    });
}

const TiposMediaController = {
    // Método para listar los tipos de media
    index: (req, res) => {
        db.all('SELECT * FROM TiposMedia WHERE activo = 1 ORDER BY orden', (err, results) => {
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
    store: async (req, res) => {
        const {nombre} = req.body;
        const activo = req.body.activo ? 1 : 0;

        const orden = await getNextOrder('TiposMedia');
        console.log(orden);
        if (!nombre) {
            req.flash('error', 'Todos los campos son obligatorios.');
            return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(nombre)}&orden=${encodeURIComponent(orden)}&activo=${activo}`);
        }

        const query = `INSERT INTO TiposMedia (nombre, activo, orden) VALUES (?, ?, ?)`;
        db.run(query, [nombre, activo, orden], function(err) {
            if (err) {
                req.flash('error', 'Error al insertar en la base de datos.');
                return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(nombre)}&orden=${encodeURIComponent(orden)}&activo=${activo}`);
            }

            req.flash('success', 'Tipo de media creado correctamente! Espera a que los programadores implementen la funciondalidad para usarlo');
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
    edit: async (req, res) => {
        const id = req.params.id;

        try {
            const tiposmedia = await new Promise((resolve, reject) => {
                db.get('SELECT * FROM TiposMedia WHERE id = ?', [id], (err, row) => {
                    if (err) reject(err);
                    resolve(row);
                });
            });

            if (!tiposmedia) {
                req.flash('error', 'Tipo de media no encontrado.');
                return res.redirect('/admin/tiposmedia/listar');
            }

            res.render('admin/tiposmedia/editarTipoMedia', {
                tiposmedia
            });
        } catch (error) {
            console.error('Error al obtener datos:', error);
            req.flash('error', 'Error al obtener datos de la base de datos.');
            res.redirect('/admin/tiposmedia/listar');
        }
    },

    // Método para actualizar el registro
    update: async (req, res) => {
        const { id, nombre } = req.body;
        const activo = req.body.activo ? 1 : 0;

        console.log('req.body:', req.body);

        try {
            const query = `UPDATE TiposMedia SET nombre = ?, activo = ? WHERE id = ?`;
            db.run(query, [nombre, activo, id], function(err) {
                if (err) {
                    req.flash('error', 'Error al actualizar en la base de datos. ' + err.message);
                    return res.redirect(`/admin/tiposmedia/${id}/editar`);
                }
                req.flash('success', 'Tipo de media actualizado correctamente!');
                res.redirect(`/admin/tiposmedia/listar`);
            });
        } catch (error) {
            console.error('Error al realizar consultas:', error);
            req.flash('error', 'Error al realizar consultas. ' + error.message);
            res.redirect(`/admin/tiposmedia/${id}/editar`);
        }
    },

    // Método para eliminar un registro
    destroy: (req, res) => {
        const id = req.params.id;

        // Verificar si el registro está siendo utilizado en la tabla Media
        db.get('SELECT COUNT(*) AS count FROM Media WHERE tiposmediaId = ?', [id], (err, mediaResult) => {
            if (err) {
                console.error('Error al verificar el uso del registro en Media:', err);
                req.flash('error', 'Error al verificar el uso del registro en Media.');
                return res.redirect('/admin/tiposmedia/listar');
            }

            if (mediaResult.count > 0) {
                const message = `No se puede eliminar el registro porque está siendo utilizado en la tabla Media (${mediaResult.count} ${mediaResult.count > 1 ? 'veces' : 'vez'}).`;
                req.flash('error', message);
                return res.redirect('/admin/tiposmedia/listar');
            }

            // Borrado lógico del registro
            const query = `UPDATE TiposMedia SET activo = 0 WHERE id = ?`;
            db.run(query, [id], function(err) {
                if (err) {
                    console.error('Error al eliminar el registro:', err);
                    req.flash('error', 'Error al eliminar el registro.');
                    return res.redirect('/admin/tiposmedia/listar');
                }

                req.flash('success', 'Tipo de media eliminado correctamente!');
                res.redirect('/admin/tiposmedia/listar');
            });
        });
    }
};

module.exports = TiposMediaController;
