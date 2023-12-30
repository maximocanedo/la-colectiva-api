'use strict';
const DefaultError = require("../DefaultError");

const AuthenticationError = class extends DefaultError {
    constructor(info = {}) {
        super({
            message: "Error de autenticación. ",
            code: "A-000",
            details: "Ocurrió un error desconocido de autenticación. ",
            type: "/errors/authentication-error",
            ...info,
        });
    }
};

module.exports = AuthenticationError;