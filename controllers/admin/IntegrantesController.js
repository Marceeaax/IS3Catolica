const IntegranteModel = require('../../models/integrante.model');
const integranteSchema = require('../../validators/integrantes/validatorsintegrantes');

const IntegrantesController = {
    index: async (req, res) => {
        try {
            const filters = {
                id: req.query.id,
                nombre: req.query.nombre,
                apellido: req.query.apellido,
                matricula: req.query.matricula,
                orden: req.query.orden
            };
            const integrantes = await IntegranteModel.getAll(filters);
            res.render("admin/integrantes/index", {
                integrantes: integrantes,
                mostrarAdmin: true,
                footerfijo: true
            });
        } catch (err) {
            console.error('Error al obtener datos:', err);
            res.status(500).send('Error al obtener datos de la base de datos');
        }
    },

    create: (req, res) => {
        res.render('admin/integrantes/crearIntegrante', {
            integrante: req.session.formData || {},
            error: req.flash('error')
        });
    },

    store: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        const { error, value } = integranteSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            req.session.formData = req.body;
            return res.redirect('/admin/integrantes/crear');
        }

        try {
            await IntegranteModel.create(value);
            delete req.session.formData;
            req.flash('success', 'Integrante creado correctamente!');
            res.redirect('/admin/integrantes/listar');
        } catch (err) {
            let errorMessage = 'Error al insertar en la base de datos.';
            if (err.message && err.message.includes('UNIQUE constraint failed: Integrantes.matricula')) {
                errorMessage = 'Error al insertar en la base de datos: La matrícula ya existe.';
            }
            req.flash('error', errorMessage);
            req.session.formData = req.body;
            res.redirect('/admin/integrantes/crear');
        }
    },

    edit: async (req, res) => {
        try {
            const id = req.params.id;
            const integrante = await IntegranteModel.getById(id);

            const formData = req.session.formData || {};
            delete req.session.formData;
            const errors = req.flash('error');

            res.render('admin/integrantes/editarIntegrante', {
                integrante: { ...integrante, ...formData },
                formData: JSON.stringify(formData),
                errors: errors,
                success: req.flash('success')
            });
        } catch (err) {
            console.error('Error al obtener datos:', err);
            res.status(500).send('Error al obtener datos de la base de datos');
        }
    },

    update: async (req, res) => {
        req.body.activo = req.body.activo === 'on';
        const { error, value } = integranteSchema.validate(req.body);
        if (error) {
            req.flash('error', error.details[0].message);
            req.session.formData = req.body;
            return res.redirect(`/admin/integrantes/${req.params.id}/editar`);
        }

        try {
            await IntegranteModel.update(req.params.id, value);
            req.flash('success', 'Integrante actualizado correctamente');
            res.redirect('/admin/integrantes/listar');
        } catch (err) {
            req.flash('error', 'Error al actualizar los datos');
            req.session.formData = req.body;
            res.redirect(`/admin/integrantes/${req.params.id}/editar`);
        }
    },

    destroy: async (req, res) => {
        const id = req.params.id;
        try {
            const mediaCount = await IntegranteModel.getByField('id', id);
            const coloresCount = await IntegranteModel.getByField('id', id);
            
            let errorMessage = '';
            if (mediaCount > 0 && coloresCount > 0) {
                errorMessage = `No se puede eliminar el registro porque está siendo utilizado en la tabla Media (${mediaCount} ${mediaCount > 1 ? 'veces' : 'vez'}) y Colores (${coloresCount} ${coloresCount > 1 ? 'veces' : 'vez'}).`;
            } else if (mediaCount > 0) {
                errorMessage = `No se puede eliminar el registro porque está siendo utilizado en la tabla Media (${mediaCount} ${mediaCount > 1 ? 'veces' : 'vez'}).`;
            } else if (coloresCount > 0) {
                errorMessage = `No se puede eliminar el registro porque está siendo utilizado en la tabla Colores (${coloresCount} ${coloresCount > 1 ? 'veces' : 'vez'}).`;
            }

            if (errorMessage) {
                req.flash('error', errorMessage);
                return res.redirect('/admin/integrantes/listar');
            }

            await IntegranteModel.delete(id);
            req.flash('success', 'Integrante eliminado correctamente!');
            res.redirect('/admin/integrantes/listar');
        } catch (err) {
            console.error('Error al eliminar el registro:', err);
            req.flash('error', 'Error al eliminar el registro.');
            res.redirect('/admin/integrantes/listar');
        }
    }
};

module.exports = IntegrantesController;
