import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./index";

/**
 * ID del recorrido al que hace referencia.
 */
export const path: StringSchema = objectId;
/**
 * Condición en la que el recorrido se realiza.
 */
export const condition: StringSchema = Joi.string().valid(...[
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
    "HOLIDAY",
    "HIGH_TIDE",
    "LOW_TIDE",
]);
/**
 * Disponibilidad del recorrido ante esta condición.
 */
export const available: BooleanSchema = Joi.boolean();
/**
 * ID del usuario que creó la disponibilidad.
 */
export const user: StringSchema = objectId;
/**
 * Fecha de creación de la disponibilidad.
 */
export const uploadDate: DateSchema = Joi.date();