'use strict';
const DefaultError = require("../DefaultError");

const TokenGenerationError = class extends DefaultError {
    constructor(info = {}) {
        super({
            message: "Error al intentar generar el token. ",
            code: "A-005",
            details: "Ocurrió un error al intentar generar el token. ",
            type: "/errors/token-generation-error",
            ...info,
        });
    }
};

module.exports = TokenGenerationError;