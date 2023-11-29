"use strict";
export default class UnimplementedMethodException extends Error {
    constructor(message = "Abstract method must be implemented.") {
        super(message);
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
};