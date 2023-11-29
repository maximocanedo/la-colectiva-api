"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Schedule = require("../schemas/Schedule");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const mongoose = require("mongoose");
const WaterBody = require("../schemas/WaterBody");
const {Types} = require("mongoose");
const {handleComments} = require("../schemas/CommentUtils");

router.use(express.json());
router.use(cookieParser());

handleComments(router, Schedule);

/* Acciones básicas */
router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["path", "dock", "time"]),
	async (req, res) => {
		try {
			const { path, dock, time } = req.body;
			const userId = req.user._id;
			let reg = await Schedule.create({
				user: userId,
				path,
				dock,
				time,
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
		let resource = await Schedule.findById({ "_id": new Types.ObjectId(id), "active": true })
			.populate({
				path: "path",
				model: "Path",
				select: "_id title boat",
				populate: {
					path: "boat",
					model: "Boat",
					select: "_id name",
				},
			})
			.populate({ path: "dock", model: "Dock", select: "_id name" });

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

		const { path, dock, user, time, active } = resource;
		// Envía la imagen como respuesta
		res.status(200).json({
			path,
			dock,
			time,
			user,
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
}); // Ver recurso
/*router.patch(
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
			const reg = await Schedule.findOne({ _id: id, active: 1 });
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
); // Editar recurso */
router.delete("/:id", pre.auth, async (req, res) => {
	try {
		const id = req.params.id;
		const resource = await Schedule.findById(id);
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


router.get("/:resId/votes", pre.auth, async (req, res) => {
	try {
		const { resId } = req.params;
		const userId = req.user._id;
		const validates = true;

		const result = await Schedule.getValidations(resId, userId);

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
}); // Validar
router.post(
	"/:resId/validate",
	pre.auth,
	pre.allow.normal,
	async (req, res) => {
		try {
			const { resId } = req.params;
			const userId = req.user._id;
			const validates = true;

			const result = await Schedule.validate(resId, userId, validates);

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

			const result = await Schedule.validate(resId, userId, validates);

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
