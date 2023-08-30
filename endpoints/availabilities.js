"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const User = require("../schemas/User");
const pre = require("./pre");
const Path = require("./../schemas/Path");
const Availability = require("../schemas/Availability");
router.use(express.json());
router.use(cookieParser());

router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["path", "condition", "available"]),
	async (req, res, next) => {
		const path_obj = Path.findOne({ _id: req.path });
		if (!path_obj)
			return res.status(404).json({
				message: "Resource not found",
			});
		else next();
	},
	async (req, res) => {
		try {
			const { path, condition, available } = req.body;
			const user = req.user._id;

			// Utilizar el método add para crear el comentario
			const newResource = await Availability.create({
				path,
				condition,
				available,
				user,
			});
			res.status(201).json({
				message: "Comment created",
				data: newResource,
			});
		} catch (err) {
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Añadir un registro Availability
router.get("/:av_id", async (req, res) => {
	try {
		let { av_id } = req.params;
		let resource = await Availability.findOne({
			_id: av_id,
			active: true,
		})
			.populate("user", "_id name")
			.populate("path", "_id title");
		if (!resource) {
			return res.status(404).json({
				message: "Resource not found. ",
			});
		}
		const validations = resource.validations.filter(
			(validation) => validation.validation === true
		).length;
		const invalidations = resource.validations.filter(
			(validation) => validation.validation === false
		).length;
		res.status(200).json({ resource, validations, invalidations });
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Ver contenido de un registro
router.delete("/:av_id", pre.auth, pre.allow.moderator, async (req, res) => {
	try {
		const { av_id } = req.params;
		const resource = await Availability.findOne({ _id: av_id });
		if (!resource) {
			return res.status(404).json({
				message: "Not found",
			});
		}
		res.active = false;
		await res.save();
		res.status(200).json({
			message: "Deleted",
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Eliminar un comentario

/* Validaciones */
router.post(
	"/:resId/validate",
	pre.auth,
	pre.allow.normal,
	async (req, res) => {
		try {
			const { resId } = req.params;
			const userId = req.user._id;
			const validates = true;

			const result = await Availability.validate(
				resId,
				userId,
				validates
			);

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

			const result = await Availability.validate(
				resId,
				userId,
				validates
			);

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
