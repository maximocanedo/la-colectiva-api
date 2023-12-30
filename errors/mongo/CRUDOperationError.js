'use strict';
const DefaultError = require("../DefaultError");

const CRUDOperationError = class extends DefaultError {
    constructor(info) {
        super({
            message: "Error al intentar crear, leer, actualizar o eliminar un recurso. ",
            details: "Hubo un error en el servidor al intentar crear, leer, actualizar o eliminar un recurso. ",
            code: "M-003",
            type: "/errors/CRUD-operation-error",
            ...info,
        });
    }
};

module.exports = CRUDOperationError;