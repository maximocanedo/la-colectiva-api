'use strict';
import {IError} from "../interfaces/responses/Error.interfaces";
export const ValidationError: IError = {
    code: "V-00",
    message: "Error de validación. ",
    details: "Los datos enviados no cumplen con las reglas de validación. "
}
export const InvalidCredentials: IError = {
    code: "V-01",
    message: "Credenciales inválidas. ",
    details: "El usuario o la contraseña ingresada son incorrectos. "
}
export const AtLeastOneFieldRequiredError: IError = {
    code: "V-02",
    message: "Se requiere al menos un campo. ",
    details: "Se requiere al menos un campo para realizar la operación. "
}
export const MissingRequiredFieldError: IError = {
    code: "V-03",
    message: "Campo requerido faltante. ",
    details: "Se requiere un campo para realizar la operación. "
}
export const InvalidInputFormatError: IError = {
    code: "V-04",
    message: "Formato de entrada inválido. ",
    details: "El formato de entrada no es válido. "
}
export const TooMuchDataError: IError = {
    code: "V-05",
    message: "Demasiados datos. ",
    details: "Se proporcionaron demasiados datos. "
}