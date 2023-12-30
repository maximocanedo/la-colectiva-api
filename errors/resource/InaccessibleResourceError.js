'use strict';
const DefaultError = require("../DefaultError");

const InaccessibleResourceError = class extends DefaultError {
    constructor(info) {
        super({
            message: "El recurso solicitado no está disponible. ",
            details: "El recurso al que se intenta acceder no está disponible, o es inaccesible. ",
            code: "R-002",
            type: "/errors/inaccessible-resource",
            ...info,
        });
    }
};

module.exports = InaccessibleResourceError;