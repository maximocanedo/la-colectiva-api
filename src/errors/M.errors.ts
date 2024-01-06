'use strict';
import {IError} from "../interfaces/responses/Error.interfaces";
export const DuplicationError: IError = {
    code: "M-01",
    message: "Error de recurso ya existente. ",
    details: "Se intentó crear un recurso nuevo con un dato único perteneciente a otro registro. "
};
export const CRUDOperationError: IError = {
    code: "M-02",
    message: "Error al intentar crear, leer, actualizar o eliminar un registro. ",
    details: "Hubo un error en el servidor al intentar crear, leer, actualizar o eliminar un registro."
};