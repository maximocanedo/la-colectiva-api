'use strict';
import * as Joi from "joi";
import { StringSchema } from "joi";
export const description: StringSchema = Joi.string().max(256).min(1);