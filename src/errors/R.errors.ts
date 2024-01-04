'use strict';
import {IError} from "../interfaces/responses/Error.interfaces";
export const ResourceNotFound: IError = {
    code: "R-01",
    message: "Recurso no encontrado. ",
    details: "El recurso solicitado no existe. "
}
export const InnaccessibleError: IError = {
    code: "R-02",
    message: "Recurso inaccesible. ",
    details: "El recurso solicitado no está disponible. "
}