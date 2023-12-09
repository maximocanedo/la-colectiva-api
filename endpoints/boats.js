"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Boat = require("../schemas/Boat");
const Photo = require("../schemas/Photo");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const { ObjectId } = require("mongodb");
const Dock = require("../schemas/Dock");
const {handleComments} = require("../schemas/CommentUtils");

router.use(express.json());
router.use(cookieParser());

handleComments(router, Boat);

/* Acciones básicas */
router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["mat", "name", "status", "enterprise"]),
	async (req, res) => {
		try {
			const { mat, name, status, enterprise } = req.body;
			const user = req.user._id;
			let reg = await Boat.create({
				mat,
				name,
				status,
				enterprise,
				user,
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
		let resource = await Boat.findOne({ _id: id, active: true })
			.populate("user", "name _id")
			.populate("enterprise", "name _id");

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

		res.status(200).json({
			user: {
				name: resource.user.name,
				_id: resource.user._id,
			},
			mat: resource.mat,
			name: resource.name,
			enterprise: {
				_id: resource.enterprise._id,
				name: resource.enterprise.name,
			},
			status: resource.status,
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
router.get("/", async (req, res) => {
	try {
		const { q, enterprise } = req.query;
		const page = parseInt(req.query.p) || 0;
		const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;


		let query = {
			$and: [
				{ name: { $regex: q || "", $options: "i" } },
			],
		};

		if (enterprise) {
			query.$and.push({ enterprise: enterprise });
		}

		const result = await Boat.listData(query, { page, itemsPerPage });

		return res.status(result.status).json(result.items);
	} catch (err) {
		console.error(err);
		return res.status(500).json({
			message: "Internal error",
		});
	}
});

router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["mat", "name", "status", "enterprise"]),
	async (req, res) => {
		try {
			const id = req.params.id;
			const userId = req.user._id;
			const reg = await Boat.findOne({ _id: id, active: 1 });
			if (!reg) {
				res.status(404).json({
					message: "There's no resource with that ID. ",
				});
				return;
			}
			if (
				reg.user.toString() != userId.toString() ||
				req.user.role >= 2
			) {
				res.status(403).json({
					message:
						"You can't edit info about a resource that other user uploaded. ",
				});
				return;
			}
			const { mat, name, status, enterprise } = req.body;
			reg.name = name;
			reg.mat = mat;
			reg.enterprise = new ObjectId(enterprise);
			reg.status = status;
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
		const resource = await Boat.findById(id);
		const isAdmin = req.user.role >= 3;
		if (!resource) {
			res.status(404).json({
				message: "There's no resource with the provided ID. ",
			});
			return;
		}
		if (resource.user != req.user._id && !isAdmin) {
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

		const result = await Boat.getValidations(resId, userId);

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

			const result = await Boat.validate(resId, userId, validates);

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

			const result = await Boat.validate(resId, userId, validates);

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

/* Imágenes */
router.get("/:id/photos/", async (req, res) => {
	try {
		const id = req.params.id;
		const resource = await Boat.findById(id)
			.select("pictures")
			.populate({
				path: "pictures",
				model: "Photo",
				select: "_id user description uploadDate",
				populate: {
					path: "user",
					model: "User",
					select: "_id name",
				},
			})
			.exec();
		if (!resource) {
			return res.status(404).json({
				message: "Resource not found",
			});
		}
		res.status(200).json(resource);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Listar fotos
router.post(
	"/:id/photos/",
	pre.auth,
	pre.allow.moderator,
	async (req, res, next) => {
		const { id } = req.params;
		const dock = await Boat.findById(id);
		if (!dock) {
			return res.status(404).json({
				message: "Resource not found",
			});
		} else next();
	},
	pre.uploadPhoto,
	async (req, res) => {
		try {
			const archivo = req.file;
			const { description } = req.body;
			const userId = req.user._id;
			const { id } = req.params;
			const dock = await Boat.findById(id);
			if (!dock) {
				return res.status(404).json({
					message: "Resource not found",
				});
			}
			const photoId = await Photo.saveUploaded(
				archivo,
				userId,
				description
			);
			await Boat.updateOne({ _id: id }, { $push: { pictures: photoId } });
			res.status(201).json({
				id: photoId,
				message: "The file was successfully saved. ",
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Subir imagen
router.delete(
	"/:id/photos/:photoId",
	pre.auth,
	pre.allow.moderator,
	async (req, res) => {
		try {
			const { id, photoId } = req.params;
			const dock = Boat.findOne(id);
			if (!dock)
				return res.status(404).json({
					message: "Resource not found",
				});
			await Boat.updateOne({ _id: id }, { $pull: { pictures: photoId } });
			// Eliminar foto en sí.
			let status = await Photo.deletePhotoById(photoId);
			if (status.success)
				return res.status(200).json({
					message: "Photo removed from resource",
				});
			res.status(200).json({
				message: "Photo unlinked from resource, but still exists. ",
			});
		} catch (err) {
			console.log(err);
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Eliminar foto

module.exports = router;
