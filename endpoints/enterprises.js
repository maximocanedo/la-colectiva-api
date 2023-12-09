"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Enterprise = require("../schemas/Enterprise");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const Path = require("../schemas/Path");
const { handleComments } = require("../schemas/CommentUtils");

router.use(express.json());
router.use(cookieParser());

handleComments(router, Enterprise);

/* Acciones básicas */

router.post(
	"/",
	pre.auth,
	pre.allow.admin,
	pre.verifyInput([
		"cuit",
		"name",
		"description",
		"foundationDate",
		"phones",
	]),
	async (req, res) => {
		try {
			const { cuit, name, description, foundationDate, phones } =
				req.body;
			const userId = req.user._id;
			let reg = await Enterprise.create({
				user: userId,
				cuit,
				name,
				description,
				foundationDate,
				phones,
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
router.get("/", async (req, res) => {
	try {
		// Utiliza find para buscar todos los registros con active: true
		let resources = await Enterprise.find({ active: true });

		if (!resources || resources.length === 0) {
			return res.status(404).json({
				message: "Resources not found",
			});
		}

		const responseData = resources.map((resource) => {
			const totalValidations = resource.validations.filter(
				(validation) => validation.validation === true
			).length;
			const totalInvalidations = resource.validations.filter(
				(validation) => validation.validation === false
			).length;

			const {
				_id,
				cuit,
				name,
				user,
				description,
				foundationDate,
				phones,
				active,
			} = resource;

			return {
				_id,
				user,
				cuit,
				name,
				description,
				foundationDate,
				phones,
				active,
				validations: totalValidations,
				invalidations: totalInvalidations,
			};
		});

		// Envía los registros como respuesta
		res.status(200).json(responseData);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});
router.patch("/:id", pre.auth, pre.allow.admin, async (req, res) => {
	try {
		const { id } = req.params; // Obtiene el ID del registro a actualizar
		const { name, cuit, description, foundationDate } = req.body; // Obtiene los campos a actualizar

		// Verifica si al menos uno de los campos está presente en la solicitud
		if (!name && !cuit && !description && !foundationDate) {
			return res.status(400).json({
				message: "Se requiere al menos un campo para actualizar.",
			});
		}

		const updatedFields = {}; // Almacena los campos actualizados dinámicamente

		// Actualiza solo los campos que se proporcionan en la solicitud
		if (name) updatedFields.name = name;
		if (cuit) updatedFields.cuit = cuit;
		if (description) updatedFields.description = description;
		if (foundationDate) updatedFields.foundationDate = foundationDate;

		// Busca y actualiza el registro en la base de datos
		const updatedEnterprise = await Enterprise.findByIdAndUpdate(
			id,
			{ $set: updatedFields },
			{ new: true }
		);

		if (!updatedEnterprise) {
			return res.status(404).json({
				message: "Registro no encontrado.",
			});
		}

		res.status(200).json({
			message: "Registro actualizado correctamente.",
			updatedEnterprise,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Error interno del servidor.",
		});
	}
});

router.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		// Utiliza findOne para buscar un registro con ID y active: true
		let resource = await Enterprise.findOne({ _id: id, active: true });

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

		const {
			_id,
			cuit,
			name,
			user,
			description,
			foundationDate,
			phones,
			active,
		} = resource;
		// Envía la imagen como respuesta
		res.status(200).json({
			_id,
			user,
			cuit,
			name,
			description,
			foundationDate,
			phones,
			active,
			validations: totalValidations,
			invalidations: totalInvalidations,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});
router.get("/:id/phones", async (req, res) => {
	try {
		const id = req.params.id;
		// Utiliza findOne para buscar un registro con ID y active: true
		const resource = await Enterprise.findOne({ _id: id, active: true });

		if (!resource) {
			return res.status(404).json({
				message: "Resource not found",
			});
		}

		const phones = resource.phones;
		return res.status(200).json({ phones });

	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});

router.post("/:id/phones", async (req, res) => {
	try {
		const id = req.params.id;
		const { phone } = req.body;
		// Utiliza findOne para buscar un registro con ID y active: true
		let resource = await Enterprise.findOne({ _id: id, active: true });

		if (!resource) {
			return res.status(404).json({
				message: "Resource not found",
			});
		}
		const result = await resource.addPhone(phone);
		return res.status(result.status).json({msg: result.msg});

	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});
router.delete("/:id/phones", async (req, res) => {
	try {
		const id = req.params.id;
		const { phone } = req.body;
		// Utiliza findOne para buscar un registro con ID y active: true
		let resource = await Enterprise.findOne({ _id: id, active: true });

		if (!resource) {
			return res.status(404).json({
				message: "Resource not found",
			});
		}
		const result = await resource.deletePhone(phone);
		return res.status(result.status).json({msg: result.msg});

	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});


router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput([
		"cuit",
		"name",
		"description",
		"foundationDate",
		"phones",
	]),
	async (req, res) => {
		try {
			const id = req.params.id;
			const userId = req.user._id;
			const reg = await Enterprise.findOne({ _id: id, active: 1 });
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
			reg.cuit = cuit;
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
); // Editar recurso
router.delete("/:id", pre.auth, async (req, res) => {
	try {
		const id = req.params.id;
		const resource = await Enterprise.findById(id);
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

		const result = await Enterprise.getValidations(resId, userId);

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

			const result = await Enterprise.validate(resId, userId, validates);

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

			const result = await Enterprise.validate(resId, userId, validates);

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
