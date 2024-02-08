import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./def.v";

export const path = objectId;
export const dock = objectId;
export const time: Joi.StringSchema<string> = Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);