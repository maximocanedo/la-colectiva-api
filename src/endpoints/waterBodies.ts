"use strict";
import dotenv from "dotenv";
import express, { Router, Request, Response, NextFunction }	from "express";
import WaterBody from "../schemas/WaterBody";
import pre from "./pre";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";


dotenv.config();
const router: Router = express.Router();

router.use(express.json());

handleComments(router, WaterBody);
handleVotes(router, WaterBody);

/* Acciones básicas */
router.get(
	"/",
	async (req: Request, res: Response): Promise<void> => {
		try {
			// Utiliza find para buscar registros con active: true
			let resources = await WaterBody.find({ active: true });

			if (resources.length === 0) {
				res.status(404).json({
					message: "Resources not found",
				});
				return;
			}

			let resourcesData = resources.map((resource) => {
				const totalValidations = resource.validations.filter(
					(validation) => validation.validation === true
				).length;
				const totalInvalidations = resource.validations.filter(
					(validation) => validation.validation === false
				).length;
				const {user, name, type, uploadDate, _id} = resource;
				return {
					user,
					name,
					type,
					uploadDate,
					_id,
					validations: totalValidations,
					invalidations: totalInvalidations,
				};
			});

			// Envía el array de resultados como respuesta
			res.status(200).json(resourcesData);
		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Internal error",
			});
		}

	}
)
router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["name", "type"]),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { name, type } = req.body;
			const userId = req.user._id;
			let reg = await WaterBody.create({
				user: userId,
				name,
				type,
			});
			res.status(201).json({
				id: reg._id,
				message: "The file was successfully saved. ",
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Crear un registro
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		// Utiliza findOne para buscar un registro con ID y active: true
		let resource = await WaterBody.findOne({ _id: id, active: true });

		if (!resource) {
			res.status(404).json({
				message: "Resource not found",
			});
			return;
		}
		const totalValidations = resource.validations.filter(
			(validation) => validation.validation === true
		).length;
		const totalInvalidations = resource.validations.filter(
			(validation) => validation.validation === false
		).length;

		// Envía la imagen como respuesta
		res.status(200).json({
			_id: resource._id,
			userId: resource.user,
			name: resource.name,
			type: resource.type,
			uploadDate: resource.uploadDate,
			validations: totalValidations,
			invalidations: totalInvalidations,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Ver recurso
router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["name", "type"]),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const id = req.params.id;
			const userId = req.user._id;
			const reg = await WaterBody.findOne({ _id: id, active: 1 });
			if (!reg) {
				res.status(404).json({
					message: "There's no resource with that ID. ",
				});
				return;
			}
			if (reg.user.toString() != userId.toString()) {
				res.status(403).json({
					message:
						"You can't edit info about a resource that other user uploaded. ",
				});
				return;
			}
			const { name, type } = req.body;
			reg.name = name;
			reg.type = type;
			await reg.save();
			res.status(200).json({
				message: "Resource updated. ",
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Internal error. ",
			});
		}
	}
); // Editar recurso
router.delete("/:id", pre.auth, async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		const resource = await WaterBody.findById(id);
		const username = req.user._id;
		const isAdmin = req.user.role >= 3;
		if (!resource) {
			res.status(404).json({
				message: "There's no photo with the provided ID. ",
			});
			return;
		}
		if (resource.user != username && !isAdmin) {
			res.status(403).json({
				message: "No image was deleted. ",
			});
			return;
		}
		resource.active = false;
		const status = await resource.save();
		res.status(200).json({
			message: "Data was disabled. ",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error. ",
		});
	}
}); // Eliminar registro




export default router;
