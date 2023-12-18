"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const User = require("../schemas/User");
const pre = require("./pre");
const users = require("../actions/users");

router.use(express.json());
router.use(cookieParser());


/* Obtener información de un usuario */
router.get("/me", pre.auth, users.getOne(true));
router.get("/:username", users.getOne(false));

/* Cambiar un dato (Contraseña, rol) de un usuario. */
router.patch("/me", pre.auth, pre.verifyInput(["password"]), users.updatePassword);
router.patch("/:username", pre.auth, pre.allow.admin, async (req, res) => {
	const { password, role } = req.body;
	if (password) {
		await users.updatePassword(req, res);
	}
	if (role) {
		await users.updateRole(req, res);
	}
	if (!password && !role) {
		res.status(400).send("Invalid field").end();
	}
});

/* Saber si un usuario existe o está deshabilitado */
router.head("/me", users.getOne(true));
router.head("/:username", users.getOne(false));

/* Actualizar información, como nombre y biografía. */
router.put("/me", users.editPersonalInfo(true));
router.put("/:username", users.editPersonalInfo(false));

/* Eliminar un usuario. */
router.delete("/me", users.deleteUser(true));
router.delete("/:username", users.deleteUser(false));


/* Crear un usuario. */
router.post("/", pre.verifyInput(["username", "name", "bio", "birth", "password"]), users.signup);

module.exports = router;