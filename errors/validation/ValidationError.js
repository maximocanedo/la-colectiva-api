'use strict';
const DefaultError = require("../DefaultError");

const ValidationError = class extends DefaultError {
    constructor(info) {
        super({
            message: "Error de validación. ",
            details: "Ocurrió un error al intentar validar la información. ",
            code: "V-000",
            type: "/errors/validation-error",
            ...info,
        });
    }
};

module.exports = ValidationError;