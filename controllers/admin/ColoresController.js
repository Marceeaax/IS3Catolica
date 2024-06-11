const ColoresModel = require('../../models/color.model');
const coloresSchema = require('../../validators/colores/validatorscolores');
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
    try {
        const color = Color(nombreColor.toLowerCase());
        return color.hex();
    } catch (e) {
        const nombreIngles = coloresEspañolAIngles[nombreColor.toLowerCase()];
        if (nombreIngles) {
            try {
                const color = Color(nombreIngles);
                return color.hex();
            } catch (e) {
                return null;
            }
        } else {
            return null;
        }
    }
}

const ColoresController = {
    index: async (req, res) => {
        try {
            const filters = {
                id: req.query.id,
                background: req.query.background ? nombreAHexadecimal(req.query.background) : null,
                headerBackground: req.query.headerBackground ? nombreAHexadecimal(req.query.headerBackground) : null,
                sectionBackground: req.query.sectionBackground ? nombreAHexadecimal(req.query.sectionBackground) : null
            };
            const colores = await ColoresModel.getAll(filters);
            res.render("admin/colores/index", {
                colores: colores,
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
            const integrantesSinColores = await new Promise((resolve, reject) => {
                db.all(`
                    SELECT i.id, i.nombre
                    FROM Integrantes i
                    LEFT JOIN Colores c ON i.id = c.integranteId
                    WHERE c.integranteId IS NULL AND i.activo = 1;
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

    store: async (req, res) => {
        req.body.activo = true;
        const { error, value } = coloresSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect(`/admin/colores/crear`);
        }

        try {
            await ColoresModel.create(value);
            req.flash('success', 'Colores asignados correctamente!');
            res.redirect('/admin/colores/listar');
        } catch (err) {
            req.flash('error', 'Error al insertar en la base de datos.');
            res.redirect(`/admin/colores/crear`);
        }
    },

    edit: async (req, res) => {
        const id = req.params.id;
        try {
            const color = await ColoresModel.getById(id);
            res.render('admin/colores/editarColores', {
                color,
                success: req.flash('success')
            });
        } catch (err) {
            console.error('Error al obtener datos:', err);
            req.flash('error', 'Error al obtener los datos del registro.');
            res.redirect('/admin/colores/listar');
        }
    },

    update: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        const { error, value } = coloresSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect(`/admin/colores/${req.params.id}/editar`);
        }

        try {
            await ColoresModel.update(req.params.id, value);
            req.flash('success', 'Colores actualizados correctamente!');
            res.redirect('/admin/colores/listar');
        } catch (err) {
            req.flash('error', 'Error al actualizar en la base de datos.');
            res.redirect(`/admin/colores/${req.params.id}/editar`);
        }
    },
    
    destroy: async (req, res) => {
        const id = req.params.id;
        try {
            await ColoresModel.delete(id);
            req.flash('success', 'Color eliminado correctamente!');
            res.redirect('/admin/colores/listar');
        } catch (err) {
            console.error('Error al eliminar el registro:', err);
            req.flash('error', 'Error al eliminar el registro.');
            res.redirect('/admin/colores/listar');
        }
    }
};

module.exports = ColoresController;
