'use strict';
import {HttpStatusCode, IError} from "../interfaces/responses/Error.interfaces";

export const ResourceNotFound: IError = {
    code: "R-01",
    message: "Recurso no encontrado. ",
    details: "El recurso solicitado no existe. ",
    http: HttpStatusCode.NOT_FOUND
}
export const InnaccessibleError: IError = {
    code: "R-02",
    message: "Recurso inaccesible. ",
    details: "El recurso solicitado no está disponible. ",
    http: HttpStatusCode.FORBIDDEN
}