import * as Joi from "joi";
import { StringSchema, DateSchema, BooleanSchema, NumberSchema } from "joi";
import { objectId } from "./def.v";

export const path = objectId;
export const dock = objectId;
export const time = Joi.date();