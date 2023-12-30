'use strict';
const DefaultError = require("./DefaultError");

const InvalidCredentials = class extends DefaultError {
    constructor(info) {
        super({
            message: "Invalid credentials. ",
            code: "E-0001",
            type: "/errors/invalid-credentials",
            ...info,
        });
    }
};

module.exports = InvalidCredentials;