'use strict';
const DefaultError = require("../DefaultError");

const UniqueKeyViolationError = class extends DefaultError {
    constructor(info) {
        super({
            message: "Error de recurso ya existente. ",
            details: "Se intentó crear un recurso nuevo con un dato único perteneciente a otro registro. ",
            code: "M-001",
            type: "/errors/unique-key-violation-error",
            ...info,
        });
    }
};

module.exports = UniqueKeyViolationError;