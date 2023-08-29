"use strict";
const crypto = require("crypto");
require("dotenv").config();
const User = require("../schemas/User");

const encrypt = (text) => {
	const n_iv = parseInt(process.env.UID_IV_LENGTH);
	let iv = crypto.randomBytes(n_iv);
	let cipher = crypto.createCipheriv(
		process.env.UID_ALGORITHM,
		Buffer.from(process.env.UID_SECRET_KEY, "hex"),
		iv
	);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString("hex") + ":" + encrypted.toString("hex");
};
const decrypt = (text) => {
	let textParts = text.split(":");
	let iv = Buffer.from(textParts.shift(), "hex");
	let encryptedText = Buffer.from(textParts.join(":"), "hex");
	let decipher = crypto.createDecipheriv(
		process.env.UID_ALGORITHM,
		Buffer.from(process.env.UID_SECRET_KEY, "hex"),
		iv
	);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
};
const authenticate = async (req, res, next) => {
	try {
		if (!req.cookies.userSession) {
			return res.status(401).json({ message: "Need to authenticate." });
		}

		const uid = decrypt(req.cookies.userSession); // Aquí deberías implementar tu lógica de descifrado
		const user = await User.findById(uid).select("-password");

		if (!user) {
			return res.status(401).json({ message: "User not found." });
		}

		req.user = user; // Añadir el usuario a la solicitud para que esté disponible en las siguientes rutas
		next(); // Continuar con la siguiente función de middleware o ruta
	} catch (err) {
		console.log({ error: "CryptingError", err });
		res.status(500).json({
			message: "Internal error",
		});
	}
};
const adminsCanAccess = async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role >= 3) {
			next();
			return;
		}
		res.status(403).json({
			message: "Action not allowed",
		});
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
};
const moderatorsCanAccess = async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role >= 2) {
			next();
			return;
		}
		res.status(403).json({
			message: "Action not allowed",
		});
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
};
const normalUsersCanAccess = async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role >= 1) {
			next();
			return;
		}
		res.status(403).json({
			message: "Action not allowed",
		});
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
};
const everybodyCanAccess = async (req, res, next) => {
	try {
		const user = req.user;
		if (user.role >= 0) {
			next();
			return;
		}
		res.status(403).json({
			message: "Action not allowed",
		});
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
};

const allow = {
	admin: adminsCanAccess,
	moderator: moderatorsCanAccess,
	normal: normalUsersCanAccess,
	all: everybodyCanAccess,
};
const auth = authenticate;
module.exports = {
	encrypt,
	decrypt,
	authenticate,
	adminsCanAccess,
	moderatorsCanAccess,
	normalUsersCanAccess,
	everybodyCanAccess,
	allow,
	auth,
};
