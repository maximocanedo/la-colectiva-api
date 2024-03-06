import * as Joi from "joi";
import { StringSchema, DateSchema, NumberSchema } from "joi";
/**
 * Nombre de usuario.
 */
export const username: StringSchema<string> = Joi
    .string()
    .regex(/^[a-zA-Z0-9_.]{3,24}$/)
    .min(3)
    .max(24);
/**
 * Contraseña de usuario.
 */
export const password: StringSchema<string> = Joi.string();
/**
 * Nombre completo del usuario.
 */
export const name: StringSchema<string> = Joi
    .string()
    .min(3)
    .max(24);
/**
 * Correo electrónico del usuario.
 */
export const mail: StringSchema<string> = Joi
    .string()
    .regex(/^.+@.+\..+$/);
/**
 * Biografía del usuario.
 */
export const bio: StringSchema<string> = Joi.string().max(48);
/**
 * Fecha de nacimiento del usuario.
 */
export const birth: DateSchema<Date> = Joi.date();
/**
 * Rol de usuario.
 */
export const role: NumberSchema<number> = Joi.number().integer().min(0).max(3);
