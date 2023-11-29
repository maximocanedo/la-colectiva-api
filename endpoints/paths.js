"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Path = require("../schemas/Path");
const pre = require("./pre");
const { handleComments } = require("../schemas/CommentUtils");

router.use(express.json());
router.use(cookieParser());

handleComments(router, Path);

/* Acciones básicas */
router.post(
	"/",
	pre.auth,
	pre.allow.admin,
	pre.verifyInput(["boat", "title", "description", "notes"]),
	async (req, res) => {
		try {
			const { boat, title, description, notes } = req.body;
			const userId = req.user._id;
			let reg = await Path.create({
				boat,
				user: userId,
				title,
				description,
				notes,
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
router.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		// Utiliza findOne para buscar un registro con ID y active: true
		let resource = await Path.findOne({ _id: id, active: true })
			.populate("user", "name _id")
			.populate("boat", "name _id");

		if (!resource) {
			return res.status(404).json({
				message: "Resource not found",
			});
		}
		const totalValidations = resource.validations.filter(
			(validation) => validation.validation === true
		).length;
		const totalInvalidations = resource.validations.filter(
			(validation) => validation.validation === false
		).length;

		const { user, boat, title, description, notes } = resource;
		// Envía la imagen como respuesta
		res.status(200).json({
			user,
			boat,
			title,
			description,
			notes,
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
router.get("/", async (req, res) => {
	try {
		// Cambia findOne por find para obtener todos los registros con active: true
		let resources = await Path.find({ active: true })
			.populate("user", "name _id")
			.populate("boat", "name _id");

		if (!resources || resources.length === 0) {
			return res.status(404).json({
				message: "Resources not found",
			});
		}

		// Mapea los recursos para obtener los datos que necesitas de cada uno
		const formattedResources = resources.map((resource) => {
			const totalValidations = resource.validations.filter(
				(validation) => validation.validation === true
			).length;
			const totalInvalidations = resource.validations.filter(
				(validation) => validation.validation === false
			).length;

			const { user, boat, title, description, notes, _id } = resource;

			return {
				_id,
				user,
				boat,
				title,
				description,
				notes,
				validations: totalValidations,
				invalidations: totalInvalidations,
			};
		});

		// Envía la lista de recursos como respuesta
		res.status(200).json(formattedResources);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Ver todos los recursos

router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["boat", "title", "description", "notes"]),
	async (req, res) => {
		res.status(404);
		return;
		try {
			const id = req.params.id;
			const userId = req.user._id;
			const reg = await Path.findOne({ _id: id, active: 1 });
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
			const { cuit, name, description, foundationDate, phones } =
				req.body;
			reg.boat = boat;
			reg.name = name;
			reg.description = description;
			reg.foundationDate = foundationDate;
			reg.phones = phones;
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
); // Editar recurso (PENDIENTE ALTERAR GLOBALMENTE)
router.delete("/:id", pre.auth, async (req, res) => {
	try {
		const id = req.params.id;
		const resource = await Path.findById(id);
		const username = req.user._id;
		const isAdmin = req.user.role >= 3;
		if (!resource) {
			res.status(404).json({
				message: "There's no resource with the provided ID. ",
			});
			return;
		}
		if (resource.user != username && !isAdmin) {
			res.status(403).json({
				message: "No resource was deleted. ",
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



/* Validaciones */
router.get("/:resId/votes", pre.auth, async (req, res) => {
	try {
		const { resId } = req.params;
		const userId = req.user._id;
		const validates = true;

		const result = await Path.getValidations(resId, userId);

		if (!result.success) {
			console.error(result.message);
			return res.status(result.status).json(result);
		}

		res.status(result.status).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});

router.post(
	"/:resId/validate",
	pre.auth,
	pre.allow.normal,
	async (req, res) => {
		try {
			const { resId } = req.params;
			const userId = req.user._id;
			const validates = true;

			const result = await Path.validate(resId, userId, validates);

			if (!result.success) {
				console.error(result.message);
				return res.status(result.status).json({
					message: result.message,
				});
			}

			res.status(result.status).json({
				message: result.message,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Validar
router.post(
	"/:resId/invalidate",
	pre.auth,
	pre.allow.normal,
	async (req, res) => {
		try {
			const { resId } = req.params;
			const userId = req.user._id;
			const validates = false;

			const result = await Path.validate(resId, userId, validates);

			if (!result.success) {
				console.error(result.message);
				return res.status(result.status).json({
					message: result.message,
				});
			}

			res.status(result.status).json({
				message: result.message,
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Invalidar

module.exports = router;
