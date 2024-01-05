'use strict';
import * as Joi from 'joi';
import * as user from "./user.v";
import * as availability from "./availability.v";
import * as boat from "./boat.v";
import * as dock from "./dock.v";
import * as comment from "./comment.v";
import * as enterprise from "./enterprise.v";
import * as picture from "./picture.v";
import * as waterBody from "./waterbody.v";

/**
 * Aclaración.
 * Como se puede observar, ninguna de estas estructuras contiene la propiedad "required".
 * Esto se debe que la necesidad de que un campo sea requerido depende del contexto en el que se lo utilice.
 * Usar con precaución.
 */
/**
 * ObjectId
 */
const objectIdF: Joi.StringSchema<string> = Joi
    .string()
    .hex()
    .length(24);

const V = {
    objectId: objectIdF,
    user,
    availability,
    boat,
    comment,
    dock,
    enterprise,
    picture,
    waterBody
};
export const objectId: Joi.StringSchema<string> = Joi
    .string()
    .hex()
    .length(24);
export default V;