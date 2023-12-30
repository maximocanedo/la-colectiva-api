'use strict';
const DefaultError = require("../DefaultError");

const MalformedToken = class extends DefaultError {
    constructor(info = {}) {
        super({
            message: "Token malformado. ",
            code: "A-003",
            details: "Se intentó realizar una acción que requiere autenticación usando un token que no tiene la estructura requerida. ",
            type: "/errors/malformed-token",
            ...info,
        });
    }
};

module.exports = MalformedToken;