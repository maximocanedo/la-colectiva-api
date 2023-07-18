"use strict";
// Llaves
const keys = require("./../keys");
// Utilidades
const utilities = require("./../logic/utilities");
const { RequestSet, ValidationTemplate } = require("./../logic/RequestSet");
// Lógica
const HashLogic = require("./../logic/HashLogic");
const SessionLogic = require("../logic/SessionLogic");
// Otras librerías
const jwt = require("jsonwebtoken");

const authenticateToken = async (req, res, next) => {
	const token = req.headers.authorization;
	if (!token) {
		return res.status(401).json({ message: "Token no proporcionado" });
	}
	let decoded = SessionLogic.verifyToken(token);
	if (decoded != null) {
		let active = await SessionLogic.IsActive(token);
		if (active) {
			req.user = decoded.username;
			next(req, res);
			return;
		}
		return res.status(401).json({ message: "Token deshabilitado" });
	}
};

const rawLogin = async (username, password, token_ok, token_err) =>
	await HashLogic.check(
		{ user: username, password: password },
		SessionLogic.register,
		token_ok,
		token_err
	);
const login__Validated = async (req, res) => {
	const { username, password } = req.body;
	let result = await rawLogin(
		username,
		password,
		(token) => {
			req.headers.authorization = `Bearer ${token}`;
			res.status(200).json({
				message: "Inicio de sesión exitoso",
			});
		},
		(error) => {
			res.status(error.status).json(error.json);
		}
	);
	return;
};
const login = async (req, res) => {
	const parametersAccepted = new RequestSet(
		[ValidationTemplate.username, ValidationTemplate.password],
		{ req, res },
		req.body
	);
	parametersAccepted.validate(login__Validated, (req, res, errors) => {
		res.status(400).json(errors);
		return;
	});
};
const logout = async (req, res) => {
	const token = req.headers.authorization;
	let z = await SessionLogic.Deactivate(token);
	if (z.result) {
		res.status(200).json({
			result: z.result,
			message: "Se inhabilitó el token (Sesión cerrada)",
		});
	} else {
		res.status(500).json({
			result: z.result,
			message:
				"Hubo un problema al inhabilitar el token. Puede que la sesión siga abierta. ",
		});
	}
};

module.exports = { rawLogin, login, logout, authenticateToken };
