'use strict';
const DefaultError = require("../DefaultError");

const InvalidCredentials = class extends DefaultError {
    constructor(info) {
        super({
            message: "Credenciales inválidas. ",
            details: "El usuario o la contraseña ingresados son incorrectos. ",
            code: "V-001",
            type: "/errors/invalid-credentials",
            ...info,
        });
    }
};

module.exports = InvalidCredentials;