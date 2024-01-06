import * as Joi from "joi";

export const objectId: Joi.StringSchema<string> = Joi
    .string()
    .hex()
    .length(24);