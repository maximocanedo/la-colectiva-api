'use strict';
import { IError } from "../interfaces/responses/Error.interfaces";
export const AttemptedUnauthorizedOperation: IError = {
    code: "U-01",
    message: "Operación no autorizada. ",
    details: "El usuario no tiene los permisos necesarios para realizar esta operación. "
}
export const UnauthorizedRecordModification: IError = {
    code: "U-02",
    message: "Modificación no autorizada. ",
    details: "El usuario no puede modificar un registro creado por alguien más. "
}