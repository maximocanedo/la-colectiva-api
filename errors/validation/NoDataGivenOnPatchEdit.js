'use strict';
const DefaultError = require("../DefaultError");

const NoDataGivenOnPatchEdit = class extends DefaultError {
    constructor(info) {
        super({
            message: "Se requiere al menos un campo para actualizar. ",
            details: "Se intentó editar un registro pero no se especificaron campos a actualizar. ",
            code: "V-002",
            type: "/errors/no-data-given-on-patch-edit",
            ...info,
        });
    }
};

module.exports = NoDataGivenOnPatchEdit;