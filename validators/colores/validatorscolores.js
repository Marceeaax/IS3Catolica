// validators/ColoresValidator.js
const Joi = require('joi');

const coloresSchema = Joi.object({
    integranteId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del integrante debe ser un número.',
            'number.integer': 'El ID del integrante debe ser un número entero.',
            'number.positive': 'El ID del integrante debe ser un número positivo.',
            'any.required': 'El ID del integrante es obligatorio.'
        }),
    background: Joi.string()
        .length(7)
        .required()
        .messages({
            'string.empty': 'El color de fondo es obligatorio.',
            'string.length': 'El color de fondo debe tener una longitud de 7 caracteres (incluyendo #).',
            'any.required': 'El color de fondo es obligatorio.'
        }),
    headerBackground: Joi.string()
        .length(7)
        .required()
        .messages({
            'string.empty': 'El color de fondo del encabezado es obligatorio.',
            'string.length': 'El color de fondo del encabezado debe tener una longitud de 7 caracteres (incluyendo #).',
            'any.required': 'El color de fondo del encabezado es obligatorio.'
        }),
    sectionBackground: Joi.string()
        .length(7)
        .required()
        .messages({
            'string.empty': 'El color de fondo de la sección es obligatorio.',
            'string.length': 'El color de fondo de la sección debe tener una longitud de 7 caracteres (incluyendo #).',
            'any.required': 'El color de fondo de la sección es obligatorio.'
        }),
    activo: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'El estado activo debe ser un valor booleano.',
            'any.required': 'El estado activo es obligatorio.'
        })
});

module.exports = coloresSchema;
