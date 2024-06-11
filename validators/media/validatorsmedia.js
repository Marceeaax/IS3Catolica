// validators/MediaValidator.js
const Joi = require('joi');

const mediaSchema = Joi.object({
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
    tiposmediaId: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del tipo de media debe ser un número.',
            'number.integer': 'El ID del tipo de media debe ser un número entero.',
            'number.positive': 'El ID del tipo de media debe ser un número positivo.',
            'any.required': 'El ID del tipo de media es obligatorio.'
        }),
    url: Joi.string()
        .uri()
        .allow('')
        .messages({
            'string.uri': 'La URL debe ser una dirección válida.'
        }),
    nombrearchivo: Joi.string()
        .allow('')
        .messages({
            'string.base': 'El nombre del archivo debe ser una cadena de caracteres.'
        }),
    activo: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'El estado activo debe ser un valor booleano.',
            'any.required': 'El estado activo es obligatorio.'
        })
});

module.exports = mediaSchema;
