'use strict';
const DefaultError = require("../DefaultError");

const ResourceNotFoundError = class extends DefaultError {
    constructor(info) {
        super({
            message: "El recurso solicitado no existe. ",
            details: "El recurso al que se intenta acceder no existe. ",
            code: "R-001",
            type: "/errors/resource-not-found",
            ...info,
        });
    }
};

module.exports = ResourceNotFoundError;