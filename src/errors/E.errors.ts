'use strict';
import {HttpStatusCode, IError} from "../interfaces/responses/Error.interfaces";
export const InternalError: IError = {
    code: "E-00",
    message: "Error interno. ",
    details: "Ha ocurrido un error desconocido. ",
    http: HttpStatusCode.INTERNAL_SERVER_ERROR
}