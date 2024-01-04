'use strict';
import * as Joi from 'joi';

/**
 * Aclaración.
 * Como se puede observar, ninguna de estas estructuras contiene la propiedad "required".
 * Esto se debe que la necesidad de que un campo sea requerido depende del contexto en el que se lo utilice.
 * Usar con precaución.
 */
/**
 * ObjectId
 */
export const objectId: Joi.StringSchema<string> = Joi
    .string()
    .hex()
    .length(24);

export const user = {
    /**
     * Nombre de usuario.
     */
    username: Joi
        .string()
        .regex(/^[a-zA-Z0-9_.]{3,24}$/)
        .min(3)
        .max(24),
    /**
     * Contraseña de usuario.
     */
    password: Joi.string(),
    /**
     * Nombre completo del usuario.
     */
    name: Joi
        .string()
        .min(3)
        .max(24),
    /**
     * Correo electrónico del usuario.
     */
    mail: Joi
        .string()
        .regex(/^.+@.+\..+$/),
    /**
     * Biografía del usuario.
     */
    bio: Joi.string().max(48),
    /**
     * Fecha de nacimiento del usuario.
     */
    birth: Joi.date(),
    /**
     * Rol de usuario.
     */
    role: Joi.number().min(0).max(3)
};