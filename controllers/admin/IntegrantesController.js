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

const IntegrantesController = {
    // Método para listar los integrantes
    index: function (req, res) {
        let sql = "SELECT * FROM integrantes WHERE activo = 1";
        let queryParams = [];
        
        // Construcción dinámica de la consulta SQL
        if (req.query.id) {
            sql += " AND id = ?";
            queryParams.push(req.query.id);
        }
        if (req.query.nombre) {
            sql += " AND nombre LIKE ?";
            queryParams.push('%' + req.query.nombre + '%');
        }
        if (req.query.apellido) {
            sql += " AND apellido LIKE ?";
            queryParams.push('%' + req.query.apellido + '%');
        }
        if (req.query.matricula) {
            sql += " AND matricula LIKE ?";
            queryParams.push('%' + req.query.matricula + '%');
        }
        if (req.query.orden) {
            sql += " AND orden = ?";
            queryParams.push(req.query.orden);
        }
    
        console.log("SQL query:", sql);
    
        db.all(sql, queryParams, (err, results) => {
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
    store: async (req, res) => {
        const { nombre, apellido, matricula } = req.body;
        const activo = req.body.activo ? 1 : 0;

        if (!nombre || !apellido || !matricula) {
            req.flash('error', 'Todos los campos son obligatorios.');
            req.session.formData = req.body;
            return res.redirect('/admin/integrantes/crear');
        }

        const orden = await getNextOrder('integrantes');

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
        const id = req.params.id;
        db.get('SELECT * FROM Integrantes WHERE id = ?', [id], (err, row) => {
            if (err) {
                console.error('Error al obtener datos:', err);
                return res.status(500).send('Error al obtener datos de la base de datos');
            }

            // Comprobar si hay datos del formulario previamente enviados
            const formData = req.session.formData || {};
            delete req.session.formData;
            const errors = req.flash('error');


            // Mezclar datos originales con datos enviados
            const integrante = { ...row, ...formData };

            res.render('admin/integrantes/editarIntegrante', {
                integrante: integrante,
                formData: JSON.stringify(formData),  // Pasar formData como JSON
                errors: errors,
                success: req.flash('success')
            });
        });
    },

    update: (req, res) => {
        const id = req.params.id;
        const { nombre, apellido, matricula, activo } = req.body;

        if (!nombre || !apellido || !matricula) {
            req.flash('error', 'Todos los campos son obligatorios');
            req.session.formData = req.body;
            return res.redirect(`/admin/integrantes/${id}/editar`);
        }

        const activoEstado = activo === 'on' ? 1 : 0;

        db.run('UPDATE Integrantes SET nombre = ?, apellido = ?, matricula = ?, activo = ? WHERE id = ?', 
        [nombre, apellido, matricula, activoEstado, id], (err) => {
            if (err) {
                console.error('Error al actualizar datos:', err);
                req.flash('error', 'Error al actualizar los datos');
                req.session.formData = req.body;
                return res.redirect(`/admin/integrantes/${id}/editar`);
            }
            req.flash('success', 'Integrante actualizado correctamente');
            res.redirect('/admin/integrantes/listar');
        });
    },

    // Método para eliminar un registro
    destroy: (req, res) => {
        const id = req.params.id;

        // Verificar si el registro está siendo utilizado en las tablas Media y Colores
        db.get('SELECT COUNT(*) AS count FROM Media WHERE integranteId = ? AND activo = 1', [id], (err, mediaResult) => {
            if (err) {
                console.error('Error al verificar el uso del registro en Media:', err);
                req.flash('error', 'Error al verificar el uso del registro en Media.');
                return res.redirect('/admin/integrantes/listar');
            }

            db.get('SELECT COUNT(*) AS count FROM Colores WHERE integranteId = ? AND activo = 1', [id], (err, coloresResult) => {
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
