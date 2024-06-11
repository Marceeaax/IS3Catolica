const TiposMediaModel = require('../../models/tipomedia.model');
const tiposMediaSchema = require('../../validators/tiposmedia/validatorstiposmedia.js');

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

const TiposMediaController = {
    index: async (req, res) => {
        try {
            const filters = {
                id: req.query.id,
                nombre: req.query.nombre,
                orden: req.query.orden
            };
            const tiposMedia = await TiposMediaModel.getAll(filters);
            res.render("admin/tiposmedia/index", {
                tiposMedia: tiposMedia,
                mostrarAdmin: true,
                footerfijo: true
            });
        } catch (err) {
            console.error('Error al obtener datos:', err);
            res.status(500).send('Error al obtener datos de la base de datos');
        }
    },

    create: (req, res) => {
        res.render('admin/tiposmedia/creartipomedia', {
            nombre: req.query.nombre || '',
            orden: req.query.orden || '',
            activo: req.query.activo === '1',
            error: req.flash('error'),
            success: req.flash('success')
        });
    },

    store: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        const { error, value } = tiposMediaSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(req.body.nombre)}&orden=${encodeURIComponent(req.body.orden)}&activo=${req.body.activo ? 1 : 0}`);
        }

        try {
            await TiposMediaModel.create(value);
            req.flash('success', 'Tipo de media creado correctamente! Espera a que los programadores implementen la funcionalidad para usarlo');
            res.redirect('/admin/tiposmedia/listar');
        } catch (err) {
            req.flash('error', 'Error al insertar en la base de datos.');
            res.redirect(`/admin/tiposmedia/crear?nombre=${encodeURIComponent(value.nombre)}&orden=${encodeURIComponent(value.orden)}&activo=${value.activo}`);
        }
    },

    edit: async (req, res) => {
        const id = req.params.id;

        try {
            const tiposmedia = await TiposMediaModel.getById(id);

            if (!tiposmedia) {
                req.flash('error', 'Tipo de media no encontrado.');
                return res.redirect('/admin/tiposmedia/listar');
            }

            res.render('admin/tiposmedia/editarTipoMedia', {
                tiposmedia,
                error: req.flash('error'),
                success: req.flash('success')
            });
        } catch (error) {
            console.error('Error al obtener datos:', error);
            req.flash('error', 'Error al obtener datos de la base de datos.');
            res.redirect('/admin/tiposmedia/listar');
        }
    },

    update: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        const { error, value } = tiposMediaSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            return res.redirect(`/admin/tiposmedia/${req.params.id}/editar`);
        }

        try {
            await TiposMediaModel.update(req.params.id, value);
            req.flash('success', 'Tipo de media actualizado correctamente!');
            res.redirect('/admin/tiposmedia/listar');
        } catch (err) {
            req.flash('error', 'Error al actualizar en la base de datos. ' + err.message);
            res.redirect(`/admin/tiposmedia/${req.params.id}/editar`);
        }
    },

    destroy: async (req, res) => {
        const id = req.params.id;

        try {
            const mediaCount = await new Promise((resolve, reject) => {
                db.get('SELECT COUNT(*) AS count FROM Media WHERE tiposmediaId = ?', [id], (err, row) => {
                    if (err) reject(err);
                    resolve(row.count);
                });
            });

            if (mediaCount > 0) {
                const message = `No se puede eliminar el registro porque está siendo utilizado en la tabla Media (${mediaCount} ${mediaCount > 1 ? 'veces' : 'vez'}).`;
                req.flash('error', message);
                return res.redirect('/admin/tiposmedia/listar');
            }

            await TiposMediaModel.delete(id);
            req.flash('success', 'Tipo de media eliminado correctamente!');
            res.redirect('/admin/tiposmedia/listar');
        } catch (err) {
            console.error('Error al eliminar el registro:', err);
            req.flash('error', 'Error al eliminar el registro.');
            res.redirect('/admin/tiposmedia/listar');
        }
    }
};

module.exports = TiposMediaController;
