import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./def.v";
/**
 * ID de la embarcación que realiza el recorrido.
 */
export const boat = objectId;
/**
 * Título del recorrido, sirve para diferenciarlo.
 */
export const title = Joi.string().max(48).min(3);
/**
 * ID del usuario que registró el recorrido.
 */
export const user = objectId;
/**
 * Descripción del recorrido.
 */
export const description = Joi.string().max(128).min(3);
/**
 * Notas del recorrido.
 */
export const notes = Joi.string().max(256);
/**
 * Fecha de registro.
 */
export const uploadDate = Joi.date();
/**
 * Estado del registro.
 */
export const active = Joi.boolean();