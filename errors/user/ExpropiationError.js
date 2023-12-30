'use strict';
const DefaultError = require("../DefaultError");

const ExpropiationError = class extends DefaultError {
    constructor(info) {
        super({
            message: "No puede modificar un registro creado por alguien más. ",
            details: "Intentó alterar un registro que fue creado por otro usuario.  ",
            code: "U-002",
            type: "/errors/expropiation-error",
            ...info,
        });
    }
};

module.exports = ExpropiationError;