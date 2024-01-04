import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./index";

export const name: StringSchema = Joi.string().max(48).min(3);
export const address: NumberSchema = Joi.number().min(0);
export const region: StringSchema = objectId;
export const notes: StringSchema = Joi.string().max(128);
export const status: NumberSchema = Joi.number().valid(...[0, 1, 2]);
export const user: StringSchema = objectId;
export const coordinates = Joi.array().length(2).items(
    Joi.number().required(),
    Joi.number().required()
);