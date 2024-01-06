'use strict';
import * as Joi from "joi";
import {NumberSchema, StringSchema} from "joi";
export const name: StringSchema = Joi.string().max(48).min(3);
export const type: NumberSchema = Joi.number().valid(0,1,2,3,4,5,6,7,8,9,10,11,12,13,14);