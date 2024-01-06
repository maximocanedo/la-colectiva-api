import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./def.v";

/**
 * Número de CUIT de la empresa.
 */
export const cuit = Joi.string();
/**
 * Nombre de la empresa.
 */
export const name = Joi.string().min(3).max(48);
/**
 * ID del usuario que registró la empresa.
 */
export const user = objectId;
/**
 * Descripción de la empresa.
 */
export const description = Joi.string().max(128).min(3);
/**
 * Fecha de fundación de la empresa.
 */
export const foundationDate = Joi.date();
/**
 * Número de teléfono.
 */
export const phone = Joi.string();
export const phones = Joi.array().items(Joi.string());
