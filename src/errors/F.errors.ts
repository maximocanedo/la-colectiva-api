import {HttpStatusCode, IError} from "../interfaces/responses/Error.interfaces";

export const UploadError: IError = {
    code: "F-00",
    message: "Error al subir archivo. ",
    details: "Ocurrió un error al subir el archivo. ",
    http: HttpStatusCode.INTERNAL_SERVER_ERROR
}
export const InvalidFileType: IError = {
    code: "F-01",
    message: "Extensión no admitida. ",
    details: "El archivo no tiene una extensión válida, o esta no es admitida. ",
    http: HttpStatusCode.UNSUPPORTED_MEDIA_TYPE
}
export const FileTooLarge: IError = {
    code: "F-02",
    message: "Archivo demasiado grande. ",
    details: "El archivo excede el tamaño máximo permitido. ",
    http: HttpStatusCode.BAD_REQUEST
}
export const TooManyFiles: IError = {
    code: "F-03",
    message: "Demasiados archivos. ",
    details: "El número de archivos excede el máximo permitido. ",
    http: HttpStatusCode.BAD_REQUEST
}