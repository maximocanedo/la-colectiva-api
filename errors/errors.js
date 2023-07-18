"use strict";

class ValidationError extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
}
class ConnectionError extends Error {
	constructor(message) {
		super(message);
		this.name = "ConnectionError";
	}
}
class InputError extends Error {
	constructor(message) {
		super(message);
		this.name = "InputError";
	}
}

module.exports = { ValidationError, ConnectionError, InputError };
