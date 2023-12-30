'use strict';
const DefaultError = require("../DefaultError");

const DeleteOperationError = class extends DefaultError {
    constructor(info) {
        super({
            message: "Error al intentar eliminar un recurso. ",
            details: "Hubo un error en el servidor al intentar eliminar el registro especificado. ",
            code: "M-002",
            type: "/errors/delete-operation-error",
            ...info,
        });
    }
};

module.exports = DeleteOperationError;