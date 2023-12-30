'use strict';

const DefaultError = require("../DefaultError");

const ExpiredToken = class extends DefaultError {
    constructor(info = {}) {
        super({
            message: "El token expiró. ",
            code: "A-001",
            type: "/errors/expired-token",
            details: "Se intentó realizar una acción que requiere autenticación usando un token expirado. Por favor, inicie sesión nuevamente. ",
            ...info,
        });
    }
};

module.exports = ExpiredToken;