"use strict";
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const { Mongoose, ObjectId } = require("mongoose");
const crypto = require("crypto");
require("dotenv").config();
const User = require("../schemas/User");

router.use(express.json());
router.use(cookieParser());

const encrypt = (data) => {
	// Cifrar los datos
	const cipher = crypto.createCipher(
		"aes-256-cbc",
		process.env.UID_SECRET_KEY
	);
	let encryptedData = cipher.update(data, "utf-8", "hex");
	encryptedData += cipher.final("hex");
	return encryptedData;
};
const decrypt = (encryptedData) => {
	// Descifrar los datos
	const decipher = crypto.createDecipher(
		"aes-256-cbc",
		process.env.UID_SECRET_KEY
	);
	let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
	decryptedData += decipher.final("utf-8");
	return decryptedData;
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
router.get("/protected", authenticate, (req, res) => {
	res.status(200).json({
		message: "Successfully authenticated",
		user: req.user,
	});
});
router.post("/change-password", authenticate, async (req, res) => {
	const requiredProps = ["password"];
	const missingProps = requiredProps.filter((prop) => !(prop in req.body));
	if (missingProps.length > 0) {
		return res.status(400).json({
			message: `Missing required properties: ${missingProps.join(", ")}`,
		});
	}
	try {
		const userId = req.user._id; // Obtener el ID del usuario autenticado
		const { password } = req.body; // Nueva contraseña que deseas establecer

		// Buscar el usuario completo por su ID
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found." });
		}

		// Cambiar la contraseña en el objeto del usuario
		user.password = password;

		// Guardar el usuario con la nueva contraseña
		const updatedUser = await user.save();

		res.status(200).json({
			message: "Password updated successfully.",
			//user: updatedUser,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});
router.get(
	"/test/only-admin-can-enter-here",
	authenticate,
	adminsCanAccess,
	async (req, res) => {
		res.status(200).json({
			message: "You're a fuckin admin yeah",
		});
	}
);
router.post(
	"/:username/update/role/:role",
	authenticate,
	adminsCanAccess,
	async (req, res) => {
		try {
			const user = await User.findOne({ username: req.params.username });
			if (!user) {
				res.status(404).json({
					message: "Username not found. ",
				});
			}
			const roles = {
				admin: 3,
				moderator: 2,
				normal: 1,
				limited: 0,
			};
			const role_received = req.params.role;
			if (!role_received || !(role_received in roles)) {
				res.status(400).json({
					message: "Invalid value for role",
				});
			}
			user.role = roles[role_received];
			user.save();
			res.status(200).json({
				message: "Role updated successfully. ",
			});
		} catch (err) {
			res.status(500).json({
				message: "Internal error. ",
			});
		}
	}
);
router.get("/:username", async (req, res) => {
	try {
		const username = req.params.username;
		let user = await User.findOne({ username }, { password: 0 });
		if (!user) {
			res.status(404).json({
				message: "User not found. ",
			});
			return;
		}
		res.status(200).json(user);
		return;
	} catch (e) {
		console.log({ e });
		res.status(500).json({
			message: "An error occured. ",
		});
		return;
	}
});
router.post("/login", async (req, res) => {
	const { username, password } = req.body;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}
		const passwordMatch = await user.comparePassword(password);
		if (passwordMatch) {
			// Set cookie to store session
			const uid = user._id.toString();
			const encrypted_uid = encrypt(uid);
			res.cookie("userSession", encrypted_uid, { httpOnly: true });
			return res.status(200).json({ message: "Login successful" });
		} else {
			return res.status(401).json({ message: "Invalid credentials" });
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Server error" });
	}
});
router.post("/logout", async (req, res) => {
	try {
		res.clearCookie("userSession");
		res.status(200).json({
			message: "Logout successful",
		});
	} catch (err) {
		res.status(500).json({
			message: "Error during logout",
		});
	}
});
router.post("/signup", async (req, res) => {
	try {
		// Recibir los datos.
		// Verificar si todas las propiedades requeridas están presentes en req.body
		const requiredProps = ["username", "name", "bio", "birth", "password"];
		const missingProps = requiredProps.filter(
			(prop) => !(prop in req.body)
		);
		if (missingProps.length > 0) {
			return res.status(400).json({
				message: `Missing required properties: ${missingProps.join(
					", "
				)}`,
			});
		}
		let { username, name, bio, birth, password } = req.body;
		const usernameIsAvailable = await User.isUsernameAvailable(username);
		if (!usernameIsAvailable) {
			res.json({
				message: "Username already exists",
			});
			return;
		}
		// Validar datos.
		let newUser = new User({ username, name, bio, birth, password });
		// Guardar.
		const savedStatus = await newUser.save();
		res.status(201).json(savedStatus); // .json({...savedStatus, password: null})
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
