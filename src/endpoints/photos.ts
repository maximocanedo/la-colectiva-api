"use strict";

import dotenv from "dotenv";
import express, { Request, Response, NextFunction, Router } from "express";
import Photo from "../schemas/Photo";
import pre from "./pre";
import path from "path";
import fs from "fs";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";
import E from "../errors";
import V from "../validators";


dotenv.config();
const router: Router = express.Router();
router.use(express.json());

handleComments(router, Photo);
handleVotes(router, Photo);

router.post(
	"/upload",
	pre.auth,
	pre.allow.moderator,
	pre.uploadPhoto,
	async (req: Request, res: Response): Promise<void> => {
		try {
			const archivo = req.file;
			console.log({ file: req.file });
			const { description } = req.body;
			const userId = req.user._id;
			const photoId = await Photo.saveUploaded(
				archivo,
				userId,
				description
			);
			res.status(201).json({
				id: photoId,
				message: "The file was successfully saved. ",
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({error: E.InternalError});
		}
	}
); // Subir imagen
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		const photoDetails = await Photo.getPhotoDetailsById(id);
		if (!photoDetails) {
			res.status(404).json({error: E.ResourceNotFound});
			return;
		}
		res.status(200).json(photoDetails);
	} catch (err) {
		console.error(err);
		res.status(500).json({error: E.InternalError});
	}
}); // Ver detalles de imagen
router.get("/:id/view", async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		let pic = await Photo.findById(id);

		if (!pic) {
			res.status(404).json({error: E.ResourceNotFound});
			return;
		}

		let fullRoute: string = path.join(__dirname, "../.." + process.env.PIC_ROOT_FOLDER, pic.filename);

		// Envía la imagen como respuesta
		res.sendFile(fullRoute);
	} catch (err) {
		console.error(err);
		res.status(500).json({error: E.InternalError});
	}
}); // Ver imagen
router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.expect({
		description: V.picture.description.required(),
	}),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const id: string = req.params.id;
			const username: string = req.user.username;
			const pic = await Photo.findOne({ _id: id, active: 1 });
			if (!pic) {
				res.status(404).json({error: E.ResourceNotFound});
				return;
			}
			if (pic.user != req.user._id) {
				res.status(403).json({error: E.UnauthorizedRecordModification});
				return;
			}
			if (!req.body.description) {
				res.status(400).json({ error: E.MissingRequiredFieldError});
				return;
			}
			pic.description = req.body.description;
			await pic.save();
			res.status(200).json({
				message: "Description updated. ",
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({error: E.InternalError});
		}
	}
); // Editar pie de imagen
router.delete("/:id", pre.auth, async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		const pic = await Photo.findById(id);
		const username = req.user.username;
		const isAdmin = req.user.role >= 3;
		if (!pic) {
			res.status(404).json({error: E.ResourceNotFound});
			return;
		}
		if (pic.user != req.user._id && !isAdmin) {
			res.status(403).json({error: E.AttemptedUnauthorizedOperation});
			return;
		}
		pic.active = false;
		const status = await pic.save();

		let fullRoute = path.join(__dirname, ".." + process.env.PIC_ROOT_FOLDER, pic.filename);

		// Elimina el archivo
		fs.unlink(fullRoute, (err) => {
			if (err) {
				console.error("Error al eliminar el archivo:", err);
				res.status(500).json({error: E.CRUDOperationError});
			} else {
				res.status(200).json({
					message: "File was deleted and data was disabled. ",
				});
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({error: E.InternalError});
	}
}); // Eliminar imagen


export default router;
