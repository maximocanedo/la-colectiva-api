'use strict';
const DefaultError = require("../DefaultError");

const UnsupportedToken = class extends DefaultError {
    constructor(info = {}) {
        super({
            message: "Token no soportado. ",
            code: "A-004",
            details: "El sistema no soporta el token recibido. ",
            type: "/errors/unsupported-token",
            ...info,
        });
    }
};

module.exports = UnsupportedToken;