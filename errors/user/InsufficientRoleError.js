'use strict';
const DefaultError = require("../DefaultError");

const InsufficientRoleError = class extends DefaultError {
    constructor(info) {
        super({
            message: "No dispone del rol necesario para realizar esta acción. ",
            details: "No dispone del rol mínimo y requerido para realizar la acción deseada. ",
            code: "U-001",
            type: "/errors/insufficient-role",
            ...info,
        });
    }
};

module.exports = InsufficientRoleError;