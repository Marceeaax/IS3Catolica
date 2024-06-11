const Joi = require('joi');

const tiposMediaSchema = Joi.object({
    nombre: Joi.string()
        .min(1)
        .max(30)
        .required()
        .messages({
            'string.empty': 'El nombre es obligatorio.',
            'string.min': 'El nombre debe tener al menos 1 caracter.',
            'string.max': 'El nombre debe tener un máximo de 30 caracteres.',
            'any.required': 'El nombre es obligatorio.'
        }),
    activo: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'El estado activo debe ser un valor booleano.',
            'any.required': 'El estado activo es obligatorio.'
        }),
}).unknown(); // Permitir campos adicionales como 'orden'

module.exports = tiposMediaSchema;
