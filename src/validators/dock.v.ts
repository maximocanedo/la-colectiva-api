import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./def.v";

/**
 * Nombre del muelle.
 */
export const name: StringSchema = Joi.string().max(48).min(3);
/**
 * Altura del muelle.
 */
export const address: NumberSchema = Joi.number().min(0);
/**
 * Región o cuerpo de agua en dónde se encuentra el muelle.
 * En el caso del Arroyo La Perla, sería el Río Sarmiento.
 */
export const region: StringSchema = objectId;
/**
 * Notas adicionales con respecto al muelle.
 */
export const notes: StringSchema = Joi.string().max(128);
/**
 * Propiedad del muelle (Público, privado, de un negocio, etc.)
 */
export const status: NumberSchema = Joi.number().valid(...[0, 1, 2, 3, 4, 5]);
/**
 * ID del usuario que registró el muelle.
 */
export const user: StringSchema = objectId;
/**
 * Coordenadas geográficas del muelle. Latitud y longitud.
 */
export const coordinates: Joi.ArraySchema<number[]> = Joi.array().length(2).items(
    Joi.number().required(),
    Joi.number().required()
);
