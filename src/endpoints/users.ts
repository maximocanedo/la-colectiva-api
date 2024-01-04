"use strict";
import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import pre from "./pre";
import users from "../actions/users";
import * as v from "../validators/index";
const router: Router = express.Router();
dotenv.config();


router.use(express.json());


/* Obtener información de un usuario */
router.get("/me", pre.auth, users.getOne(true));
router.get("/:username", users.getOne(false));

/* Cambiar un dato (Contraseña, rol) de un usuario. */
router.patch("/me", pre.auth, pre.expect({
	password: v.user.password.required()
}), users.updatePassword);
router.patch("/:username", pre.auth, pre.allow.admin, pre.expect({
	password: v.user.password,
	role: v.user.role
}), async (req: Request, res: Response): Promise<void> => {
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
router.post("/", pre.expect({
	username: v.user.username.required(),
	name: v.user.name.required(),
	bio: v.user.bio.required(),
	mail: v.user.mail,
	birth: v.user.birth.required(),
	password: v.user.password.required()
}),  users.signup);

router.post("/me/mail", users.startMailVerification);
router.post("/validate/:validationId", users.validateMail);


export default router;