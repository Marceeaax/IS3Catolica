const Joi = require('joi');

const integranteSchema = Joi.object({
    nombre: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/) // Solo permite letras y espacios
        .min(2)
        .max(30)
        .required()
        .messages({
            'string.empty': 'El nombre es obligatorio.',
            'string.pattern.base': 'El nombre solo puede contener letras y espacios.',
            'string.min': 'El nombre debe tener al menos 2 caracteres.',
            'string.max': 'El nombre no puede tener más de 30 caracteres.',
            'any.required': 'El nombre es obligatorio.'
        }),
    apellido: Joi.string()
        .pattern(/^[a-zA-Z\s]+$/) // Solo permite letras y espacios
        .min(2)
        .max(30)
        .required()
        .messages({
            'string.empty': 'El apellido es obligatorio.',
            'string.pattern.base': 'El apellido solo puede contener letras y espacios.',
            'string.min': 'El apellido debe tener al menos 2 caracteres.',
            'string.max': 'El apellido no puede tener más de 30 caracteres.',
            'any.required': 'El apellido es obligatorio.'
        }),
    matricula: Joi.string()
        .pattern(/^(?!^[a-zA-Z]+$)([a-zA-Z0-9]{4,10})$/) // No permite solo letras, pero permite solo números o combinaciones
        .required()
        .messages({
            'string.empty': 'La matrícula es obligatoria.',
            'string.pattern.base': 'La matrícula debe contener entre 4 y 10 caracteres, y no puede estar compuesta exclusivamente por letras.',
            'any.required': 'La matrícula es obligatoria.'
        }),
    activo: Joi.boolean().optional()
}).unknown(); // Permitir campos adicionales como 'orden'

module.exports = integranteSchema;
