"use strict";
import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import pre from "./pre";
import users from "../actions/users";
import V from "../validators/index";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";
const router: Router = express.Router();
dotenv.config();


router.use(express.json());


/* Obtener información de un usuario */
router.get("/me", pre.auth, users.getOne(true));
router.get("/:username", users.getOne(false));

/* Cambiar un dato (Contraseña, rol) de un usuario. */
router.patch("/me", pre.auth, pre.expect({
	password: V.user.password.required()
}), users.updatePassword);
router.patch("/:username", pre.auth, pre.allow.admin, pre.expect({
	password: V.user.password,
	role: V.user.role
}), async (req: Request, res: Response): Promise<void> => {
	const { password, role } = req.body;
	if (password) {
		await users.updatePassword(req, res);
		return;
	}
	if (role) {
		await users.updateRole(req, res);
		return;
	}
	if (!password && !role) {
		res.status(400).json({ error: E.AtLeastOneFieldRequiredError }).end();
		return;
	}
});

/* Saber si un usuario existe o está deshabilitado */
router.head("/me", users.getOne(true));
router.head("/:username", users.getOne(false));

/* Actualizar información, como nombre y biografía. */
router.put("/me", pre.auth, users.editPersonalInfo(true));
router.put("/:username", pre.auth, pre.allow.admin, users.editPersonalInfo(false));

/* Eliminar un usuario. */
router.delete("/me", pre.auth, users.deleteUser(true));
router.delete("/:username", pre.auth, pre.allow.admin, users.deleteUser(false));


/* Crear un usuario. */
router.post("/", pre.expect({
	username: V.user.username.required(),
	name: V.user.name.required(),
	bio: V.user.bio.required(),
	email: V.user.mail.required(),
	birth: V.user.birth.required(),
	password: V.user.password.required()
}),  users.signup);

router.post("/me/mail", users.startMailVerification);
router.post("/validate/:validationId", users.validateMail);


export default router;