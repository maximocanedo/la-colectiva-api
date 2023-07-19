"use strict";
const Response = require("../entity/Response");
const Connection = require("../data/Connection");
const Session = require("../entity/Session");
const jwt = require("jsonwebtoken");
const keys = require("./../keys");
const SessionData = require("../data/SessionData");

const Insert = async (username) => {
	let user = new User();
	user.username = username;
	let result = SessionData.insert(user);
	if (!result.ErrorFound) {
		return {
			result,
		};
	} else {
		return {
			result: null,
		};
	}
};

const verifyToken = (token) => {
	try {
		const decoded = jwt.verify(token, keys.TOKEN_AUTHORIZATION_KEY);
		return decoded;
	} catch (err) {
		return null;
	}
};

const IsActive = async (token) => {
	const decoded = verifyToken(token);
	if (decoded != null) {
		let result = await SessionData.getStatus(decoded.sessionId);
		if (!result.ErrorFound) {
			let data = result.Message;
			const rows = data;
			if (rows[0] != null) {
				return rows[0][SessionData.sn.Columns.id];
			}
		}
		return false;
	}
	return false;
};

const Deactivate = async (id) => {
	let result = SessionData.disable(id);
	if (!result.ErrorFound && result.AffectedRows == 1) {
		return {
			result: true,
		};
	} else {
		return {
			result: false,
		};
	}
};

const register = async (cr, success = (obj) => {}, onError = (obj) => {}) => {
	if (cr.errCode == 200) {
		// Generamos código de sesión:
		let rows = await SessionData.insert(cr.username);
		if (rows.error == null) {
			if (rows.count >= 1) {
				const NuevoID = rows.sid;

				// Generar token con NuevoID y username.
				const token = jwt.sign(
					{ username: cr.username, sessionId: NuevoID },
					keys.TOKEN_AUTHORIZATION_KEY,
					{ expiresIn: "8h" }
				);
				success(token);
				return;
				// Guardar token en el cliente.
				//req.headers.authorization = `Bearer ${token}`;
			}
			onError({
				status: 500,
				json: {
					err: "Hubo un error al intentar guardar tu sesión. ",
				},
			});
			return;
		}
		onError({
			status: 500,
			json: {
				err: "Hubo un error al intentar procesar la sesión. ",
			},
		});
		return;
	} else {
		onError({
			status: 403,
			json: {
				err: "Usuario o contraseña inválidos. ",
			},
		});
		return;
	}
};
module.exports = { Deactivate, IsActive, Insert, register, verifyToken };
