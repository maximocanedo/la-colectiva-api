"use strict";
const User = require("./../entity/User");
class Param {
	constructor(key = "", validate = (x) => x != null, warning = "") {
		this.key = key;
		this.validate = validate;
		this.warning = warning;
	}
}
class RequestSet {
	constructor(parameters = [], { req, res }, data) {
		this.parameters = [...parameters];
		this.validate = (
			onSuccess = (req = null, res = null) => {},
			onError = (req, res, errors) => {}
		) => {
			let errors = this.parameters
				.filter((parameter) => {
					let val = data[parameter.key];
					return !parameter.validate(val);
				})
				.map((parameter) => parameter.warning);
			const ok = this.parameters.every((parameter, i) => {
				let val = data[parameter.key];
				return parameter.validate(val);
			});
			if (ok) {
				onSuccess(req, res);
			} else {
				onError(req, res, { errors, ok, parameters: this.parameters });
			}
		};
	}
}
const ValidationTemplate = {
	password: new Param(
		"password",
		(x) => /^.{8,}$/.test(x),
		"La contraseña debe contener al menos 8 caracteres. "
	),
	username: new Param(
		"username",
		(x) => /^[a-zA-Z0-9_-]{3,24}$/.test(x),
		"El nombre de usuario ingresado no es válido. "
	),
	name: new Param(
		"name",
		(x) => /^[\p{L}\p{M}\s'-]{3,48}$/u.test(x),
		"El nombre ingresado no es válido."
	),
	surname: new Param(
		"surname",
		(x) => /^[\p{L}\p{M}\s'-]{3,48}$/u.test(x),
		"El apellido ingresado no es válido. "
	),
	role: new Param(
		"role",
		(x) => User.roles.indexOf(x) != -1,
		"El rol ingresado no es válido. "
	),
	birthdate: new Param(
		"birthdate",
		(inputDate) => {
			const date = new Date(inputDate);
			return date instanceof Date && !isNaN(date);
		},
		"La fecha ingresada no es válida. "
	),
};
module.exports = { Param, RequestSet, ValidationTemplate };
