'use strict';
const DefaultError = require("../DefaultError");

const InvalidToken = class extends DefaultError {
    constructor(info = {}) {
        super({
            message: "Token inválido. ",
            code: "A-002",
            details: "Se intentó realizar una acción que requiere autenticación usando un token inválido o corrupto. ",
            type: "/errors/invalid-token",
            ...info,
        });
    }
};

module.exports = InvalidToken;