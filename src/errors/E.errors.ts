'use strict';
import {IError} from "../interfaces/responses/Error.interfaces";
export const InternalError: IError = {
    code: "E-00",
    message: "Error interno. ",
    details: "Ha ocurrido un error desconocido. "
}