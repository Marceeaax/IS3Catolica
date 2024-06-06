const db = require('../../db/conexion');
const Color = require('color');

// Mapa de colores en español a inglés
const coloresEspañolAIngles = {
    rojo: 'red',
    azul: 'blue',
    verde: 'green',
    amarillo: 'yellow',
    negro: 'black',
    blanco: 'white',
    morado: 'purple',
    naranja: 'orange',
    rosa: 'pink',
    gris: 'gray',
    marrón: 'brown',
    cian: 'cyan',
    lima: 'lime',
    magenta: 'magenta',
    plata: 'silver',
    dorado: 'gold',
    // Añade más colores según sea necesario
};

function nombreAHexadecimal(nombreColor) {
    // Primero, intentar directamente convertir el nombre del color
    try {
        const color = Color(nombreColor.toLowerCase());
        return color.hex();
    } catch (e) {
        // Si falla, intentar convertir del español al inglés
        const nombreIngles = coloresEspañolAIngles[nombreColor.toLowerCase()];
        if (nombreIngles) {
            try {
                const color = Color(nombreIngles);
                return color.hex();
            } catch (e) {
                return null; // El color no es válido
            }
        } else {
            return null; // El color no está en el mapa ni es un color inglés válido
        }
    }
}

const ColoresController = {
    index: function (req, res) {
        let sql = "SELECT * FROM Colores WHERE activo = 1";
        let queryParams = [];
    
        console.log("Cuerpo de la solicitud", req.query);
        // Construcción dinámica de la consulta SQL
        if (req.query.id) {
            sql += " AND integranteId = ?";
            queryParams.push(req.query.id);
        }
        if (req.query.background) {
            const hexColor = nombreAHexadecimal(req.query.background);
            console.log(hexColor);
            if (hexColor) {
                sql += " AND background = ?";
                queryParams.push(hexColor);
            } else {
                sql += " AND (background LIKE ? OR background LIKE ?)";
                queryParams.push('%' + req.query.background + '%', '%' + req.query.background.toLowerCase() + '%');
            }
        }
        if (req.query.headerBackground) {
            const hexColor = nombreAHexadecimal(req.query.headerBackground);
            if (hexColor) {
                sql += " AND headerBackground = ?";
                queryParams.push(hexColor);
            } else {
                sql += " AND (headerBackground LIKE ? OR headerBackground LIKE ?)";
                queryParams.push('%' + req.query.headerBackground + '%', '%' + req.query.headerBackground.toLowerCase() + '%');
            }
        }
        if (req.query.sectionBackground) {
            const hexColor = nombreAHexadecimal(req.query.sectionBackground);
            if (hexColor) {
                sql += " AND sectionBackground = ?";
                queryParams.push(hexColor);
            } else {
                sql += " AND (sectionBackground LIKE ? OR sectionBackground LIKE ?)";
                queryParams.push('%' + req.query.sectionBackground + '%', '%' + req.query.sectionBackground.toLowerCase() + '%');
            }
        }
    
    
        db.all(sql, queryParams, (err, results) => {
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
