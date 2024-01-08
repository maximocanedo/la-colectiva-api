"use strict";
import dotenv from "dotenv";
import express, { Router, Request, Response, NextFunction }	from "express";
import WaterBody from "../schemas/WaterBody";
import pre from "./pre";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";
import E from "../errors";
import V from "../validators";


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
				res.status(404).json(E.ResourceNotFound);
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
			res.status(500).json(E.InternalError);
		}

	}
)
router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.expect({
		name: V.waterBody.name.required(),
		type: V.waterBody.type.required(),
	}),
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
			res.status(500).json(E.InternalError);
		}
	}
); // Crear un registro
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		// Utiliza findOne para buscar un registro con ID y active: true
		let resource = await WaterBody.findOne({ _id: id, active: true });

		if (!resource) {
			res.status(404).json(E.ResourceNotFound);
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
		res.status(500).json(E.InternalError);
	}
}); // Ver recurso
router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.expect({
		name: V.waterBody.name,
		type: V.waterBody.type,
	}),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { name, type } = req.body;
			if(!name && !type) {
				res.status(400).json({
					error: E.AtLeastOneFieldRequiredError
				}).end();
				return;
			}
			const id = req.params.id;
			const userId = req.user._id;
			const reg = await WaterBody.findOne({ _id: id, active: 1 });
			if (!reg) {
				res.status(404).json(E.ResourceNotFound);
				return;
			}
			if (reg.user.toString() != userId.toString()) {
				res.status(403).json(E.UnauthorizedRecordModification);
				return;
			}
			if(name) reg.name = name;
			if(type) reg.type = type;
			await reg.save();
			res.status(200).json({
				message: "Resource updated. ",
			});
		} catch (err) {
			console.error(err);
			res.status(500).json(E.InternalError);
		}
	}
); // Editar recurso
router.delete("/:id", pre.auth, pre.allow.moderator, async (req: Request, res: Response): Promise<void> => {
	try {
		const id = req.params.id;
		const resource = await WaterBody.findById(id);
		const username = req.user._id;
		const isAdmin = req.user.role >= 3;
		if (!resource) {
			res.status(404).json(E.ResourceNotFound);
			return;
		}
		if (resource.user != username && !isAdmin) {
			res.status(403).json(E.AttemptedUnauthorizedOperation);
			return;
		}
		resource.active = false;
		const status = await resource.save();
		res.status(200).json({
			message: "Data was disabled. ",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json(E.InternalError);
	}
}); // Eliminar registro




export default router;
