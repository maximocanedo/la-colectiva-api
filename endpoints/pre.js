"use strict";
const crypto = require("crypto");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Photo = require("../schemas/Photo");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
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
const verifyInput = (requiredProps) => (req, res, next) => {
	const missingProps = requiredProps.filter((prop) => !(prop in req.body));
	if (missingProps.length > 0) {
		return res.status(400).json({
			message: `Missing required properties: ${missingProps.join(", ")}`,
		});
	}
	next(); // Si todo está bien, pasa al siguiente middleware o al controlador
};
const imageFileTypes = ["image/jpeg", "image/png", "image/gif"]; // Tipos de archivos de imagen permitidos

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const destinationPath = path.join(__dirname, "../data/photos/");
		cb(null, destinationPath);
	},
	filename: (req, file, cb) => {
		// Generamos un nombre único para el archivo
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const fileExtension = file.originalname.split(".").pop();
		const fileNameWithoutExtension = file.originalname
			.split(".")
			.slice(0, -1)
			.join("-")
			.toLowerCase()
			.split(" ")
			.join("-");
		const finalFileName = `${fileNameWithoutExtension}-${uniqueSuffix}.${fileExtension}`;
		cb(null, finalFileName);
	},
	fileFilter: (req, file, cb) => {
		if (imageFileTypes.includes(file.mimetype)) {
			// Acepta el archivo si su tipo de MIME está en la lista permitida
			cb(null, true);
		} else {
			// Rechaza el archivo si su tipo de MIME no está en la lista permitida
			cb(new Error("Invalid file type"));
		}
	},
});
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5 MB en bytes
	},
});
const uploadPhoto = async (req, res, next) => {
	upload.single("file")(req, res, function (err) {
		if (err instanceof multer.MulterError) {
			// Error de Multer (tamaño excedido, etc.)
			return res.status(400).json({
				message: "Bad Request: " + err.message,
			});
		} else if (err) {
			// Error en el filtro de archivos (tipo de archivo no permitido)
			return res.status(400).json({
				message: "Bad Request: Invalid file type",
			});
		}
		// Si no hubo errores, pasa al siguiente middleware o al controlador
		next();
	});
};

const allow = {
	admin: adminsCanAccess,
	moderator: moderatorsCanAccess,
	normal: normalUsersCanAccess,
	all: everybodyCanAccess,
};
const auth = authenticate;
module.exports = {
	verifyInput,
	uploadPhoto,
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
