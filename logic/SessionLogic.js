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
	console.log({ result });
	if (!result.ErrorFound) {
		console.log(101);
		return {
			result,
		};
	} else {
		console.log(105);
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
		console.log("Error al intentar decodificar el token. ", err);
		return null;
	}
};

const IsActive = async (token) => {
	const decoded = verifyToken(token);
	if (decoded != null) {
		let result = await SessionData.getStatus(decoded.sessionId);
		if (!result.ErrorFound) {
			let data = result.ObjectReturned;
			let st = data.statement;
			const rows = st.fetchAllSync();
			if (rows >= 1) {
				return rows[0].Activo;
			}
		}
		return false;
	}
	return false;
};

const Deactivate = async (id) => {
	let result = SessionData.disable(id);
	console.log({ result });
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
	console.log("ep", { cr });
	if (cr.errCode == 200) {
		console.log("post 200 ", { cr });
		// Generamos código de sesión:
		let rows = await SessionData.insert(cr.username);
		console.log({ rows });
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
