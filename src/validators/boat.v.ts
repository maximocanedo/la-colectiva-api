import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./index";

/**
 * Matrícula de la embarcación.
 */
export const mat: StringSchema = Joi.string().min(2).max(16);
/**
 * Nombre de la embarcación.
 */
export const name: StringSchema = Joi.string().min(3).max(48);
/**
 * Estado de la embarcación. Si está en servicio o no.
 */
export const status: BooleanSchema = Joi.boolean();
/**
 * ID de la empresa a la que pertenece la embarcación.
 */
export const enterprise: StringSchema = objectId;
/**
 * ID del usuario que registró la embarcación.
 */
export const user: StringSchema = objectId;
/**
 * Fecha de registro de la embarcación.
 */
export const uploadDate: DateSchema = Joi.date();
/**
 * Estado del registro de la embarcación.
 */
export const active: BooleanSchema = Joi.boolean();