'use strict';
import {HttpStatusCode, IError} from "../interfaces/responses/Error.interfaces";
export const AuthenticationError: IError = {
    code: "A-00",
    message: "Error de autenticación. ",
    details: "Ocurrió un error desconocido de autenticación. ",
    http: HttpStatusCode.INTERNAL_SERVER_ERROR
};
export const ExpiredToken: IError = {
    code: "A-01",
    message: "Token expirado. ",
    details: "El token de autenticación ha expirado. ",
    http: HttpStatusCode.NETWORK_AUTHENTICATION_REQUIRED
};
export const InvalidToken: IError = {
    code: "A-02",
    message: "Token inválido. ",
    details: "El token de autenticación es inválido. ",
    http: HttpStatusCode.UNAUTHORIZED
};
export const MalformedToken: IError = {
    code: "A-03",
    message: "Token malformado. ",
    details: "El token de autenticación está malformado. ",
    http: HttpStatusCode.UNAUTHORIZED
};
export const UnsupportedToken: IError = {
    code: "A-04",
    message: "Token no soportado. ",
    details: "El token de autenticación no es soportado. ",
    http: HttpStatusCode.UNAUTHORIZED
};
export const TokenGenerationError: IError = {
    code: "A-05",
    message: "Error al generar el token. ",
    details: "Ocurrió un error desconocido al generar el token de autenticación. ",
    http: HttpStatusCode.UNAUTHORIZED
};
export const Unauthenticated: IError = {
    code: "A-06",
    message: "No autenticado. ",
    details: "Esta operación requiere autenticación. ",
    http: HttpStatusCode.UNAUTHORIZED
};