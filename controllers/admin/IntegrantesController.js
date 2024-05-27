const db = require('../../db/conexion');

const IntegrantesController = {
    // Método para listar los integrantes
    index: (req, res) => {
        db.all('SELECT * FROM integrantes WHERE activo = 1 ORDER BY orden', (err, results) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos de la base de datos');
            }
            res.render("admin/integrantes/index", {
                integrantes: results,
                mostrarAdmin: true,
                footerfijo: true     
            });
        });
    },

    // Método para mostrar el formulario de creación
    create: (req, res) => {
        res.render('admin/integrantes/crearIntegrante', {
            integrante: req.session.formData || {},
            error: req.flash('error')
        });
    },

    // Método para guardar en la base de datos
    store: (req, res) => {
        const { nombre, apellido, matricula, orden } = req.body;
        const activo = req.body.activo ? 1 : 0;

        if (!nombre || !apellido || !matricula || !orden) {
            req.flash('error', 'Todos los campos son obligatorios.');
            req.session.formData = req.body;
            return res.redirect('/admin/integrantes/crear');
        }

        const query = `INSERT INTO Integrantes (nombre, apellido, matricula, activo, orden) VALUES (?, ?, ?, ?, ?)`;
        db.run(query, [nombre, apellido, matricula, activo, orden], function(err) {
            if (err) {
                let errorMessage = 'Error al insertar en la base de datos.';
                if (err.message && err.message.includes('UNIQUE constraint failed: Integrantes.matricula')) {
                    errorMessage = 'Error al insertar en la base de datos: La matrícula ya existe.';
                }
                req.flash('error', errorMessage);
                req.session.formData = req.body;
                return res.redirect('/admin/integrantes/crear');
            }

            delete req.session.formData;
            req.flash('success', 'Integrante creado correctamente!');
            res.redirect('/admin/integrantes/listar');
        });
    },

    // Método para mostrar un registro
    show: (req, res) => {
        // const id = req.params.id;
        // db.get('SELECT * FROM integrantes WHERE id = ?', [id], (err, row) => {
        //     if (err) {
        //         console.error('Error al obtener datos:', err);
        //         return res.status(500).send('Error al obtener datos de la base de datos');
        //     }
        //     res.render('admin/integrantes/showIntegrante', {
        //         integrante: row,
        //         mostrarAdmin: true,
        //         footerfijo: true
        //     });
        // });
    },

    // Método para mostrar el formulario de edición
    edit: (req, res) => {
        // const id = req.params.id;
        // db.get('SELECT * FROM integrantes WHERE id = ?', [id], (err, row) => {
        //     if (err) {
        //         console.error('Error al obtener datos:', err);
        //         return res.status(500).send('Error al obtener datos de la base de datos');
        //     }
        //     res.render('admin/integrantes/editarIntegrante', {
        //         integrante: row,
        //         error: req.flash('error')
        //     });
        // });
    },

    // Método para editar un registro
    update: (req, res) => {
        // const { id, nombre, apellido, matricula, orden } = req.body;
        // const activo = req.body.activo ? 1 : 0;

        // if (!nombre || !apellido || !matricula || !orden) {
        //     req.flash('error', 'Todos los campos son obligatorios.');
        //     return res.redirect(`/admin/integrantes/editar/${id}`);
        // }

        // const query = `UPDATE Integrantes SET nombre = ?, apellido = ?, matricula = ?, activo = ?, orden = ? WHERE id = ?`;
        // db.run(query, [nombre, apellido, matricula, activo, orden, id], function(err) {
        //     if (err) {
        //         let errorMessage = 'Error al actualizar en la base de datos.';
        //         if (err.message && err.message.includes('UNIQUE constraint failed: Integrantes.matricula')) {
        //             errorMessage = 'Error al actualizar en la base de datos: La matrícula ya existe.';
        //         }
        //         req.flash('error', errorMessage);
        //         return res.redirect(`/admin/integrantes/editar/${id}`);
        //     }

        //     req.flash('success', 'Integrante actualizado correctamente!');
        //     res.redirect('/admin/integrantes/listar');
        // });
    },

    // Método para eliminar un registro
    destroy: (req, res) => {
        const id = req.params.id;

        // Verificar si el registro está siendo utilizado en las tablas Media y Colores
        db.get('SELECT COUNT(*) AS count FROM Media WHERE integranteId = ?', [id], (err, mediaResult) => {
            if (err) {
                console.error('Error al verificar el uso del registro en Media:', err);
                req.flash('error', 'Error al verificar el uso del registro en Media.');
                return res.redirect('/admin/integrantes/listar');
            }

            db.get('SELECT COUNT(*) AS count FROM Colores WHERE integranteId = ?', [id], (err, coloresResult) => {
                if (err) {
                    console.error('Error al verificar el uso del registro en Colores:', err);
                    req.flash('error', 'Error al verificar el uso del registro en Colores.');
                    return res.redirect('/admin/integrantes/listar');
                }

                let errorMessage = '';

                if (mediaResult.count > 0 && coloresResult.count > 0) {
                    errorMessage = `No se puede eliminar el registro porque está siendo utilizado en la tabla Media (${mediaResult.count} ${mediaResult.count > 1 ? 'veces' : 'vez'}) y Colores (${coloresResult.count} ${coloresResult.count > 1 ? 'veces' : 'vez'}).`;
                } else if (mediaResult.count > 0) {
                    errorMessage = `No se puede eliminar el registro porque está siendo utilizado en la tabla Media (${mediaResult.count} ${mediaResult.count > 1 ? 'veces' : 'vez'}).`;
                } else if (coloresResult.count > 0) {
                    errorMessage = `No se puede eliminar el registro porque está siendo utilizado en la tabla Colores (${coloresResult.count} ${coloresResult.count > 1 ? 'veces' : 'vez'}).`;
                }

                if (errorMessage) {
                    req.flash('error', errorMessage);
                    return res.redirect('/admin/integrantes/listar');
                }

                // Borrado lógico del registro
                const query = `UPDATE Integrantes SET activo = 0 WHERE id = ?`;
                db.run(query, [id], function(err) {
                    if (err) {
                        console.error('Error al eliminar el registro:', err);
                        req.flash('error', 'Error al eliminar el registro.');
                        return res.redirect('/admin/integrantes/listar');
                    }

                    req.flash('success', 'Integrante eliminado correctamente!');
                    res.redirect('/admin/integrantes/listar');
                });
            });
        });
    }
};

module.exports = IntegrantesController;
