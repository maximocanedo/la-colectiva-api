"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Dock = require("../schemas/Dock");
const Photo = require("../schemas/Photo");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const { ObjectId } = require("mongodb");
const Enterprise = require("../schemas/Enterprise");
const {handleComments} = require("../schemas/CommentUtils");

router.use(express.json());
router.use(cookieParser());

handleComments(router, Dock);

const docks = {
	actions: {
		explore: async (req, res) => {
			try {
				const { coordinates, radio, prefer, q } = req.body;
				const page = req.query.p || 0;
				const itemsPerPage = req.query.itemsPerPage || 10;
				let preferObj = {
					status: prefer,
					name: { $regex: q || "", $options: "i" },
				};
				if (prefer == -1) {
					preferObj = {
						status: { $gt: -1 },
						name: { $regex: q || "", $options: "i" },
					};
				}
				const query = {
					$and: [
						{
							coordinates: {
								$near: {
									$geometry: {
										type: "Point",
										coordinates: [...coordinates], // [longitud, latitud]
									},
									$maxDistance: radio,
								},
							},
						},
						preferObj,
					],
				};
				let result = await Dock.listData(query, {
					page,
					itemsPerPage,
				});

				res.status(result.status).json(result.items);
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					message: "Internal error",
				});
			}
		},
		list: async (req, res) => {
			try {
				const { prefer, q } = req.query;
				const page = req.query.p || 0;
				const itemsPerPage = req.query.itemsPerPage || 10;
				let preferObj = {
					status: prefer || -1,
				};
				if (prefer == -1) {
					preferObj = {
						status: { $gt: -1 },
					};
				}
				const query = {
					$and: [
						preferObj,
						{
							name: { $regex: q || "", $options: "i" },
						},
					],
				};
				let result = await Dock.listData(query, { page, itemsPerPage });

				return res.status(result.status).json(result.items);
			} catch (err) {
				console.error(err);
				return res.status(500).json({
					message: "Internal error",
				});
			}
		},
		read: async (req, res) => {
			try {
				const id = req.params.id;
				// Utiliza findOne para buscar un registro con ID y active: true
				let resource = await Dock.findOne({ _id: id, active: true })
					.populate("user", "name _id")
					.populate("region", "name type");

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
					name: resource.name,
					address: resource.address,
					region: {
						_id: resource.region._id,
						name: resource.region.name,
						type: resource.region.type,
					},
					notes: resource.notes,
					status: resource.status,
					uploadDate: resource.uploadDate,
					coordinates: resource.coordinates,
					validations: totalValidations,
					invalidations: totalInvalidations,
				});
			} catch (err) {
				console.error(err);
				res.status(500).json({
					message: "Internal error",
				});
			}
		},
		delete: async (req, res) => {
			try {
				const id = req.params.id;
				const resource = await Dock.findById(id);
				const username = req.user.username;
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
		},
	},
};

/* Listados */
router.get("/explore", docks.actions.explore);
router.get("/", docks.actions.list);

/* Acciones básicas */
router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput([
		"name",
		"address",
		"region",
		"notes",
		"status",
		"latitude",
		"longitude",
	]),
	async (req, res) => {
		try {
			const {
				name,
				address,
				region,
				notes,
				status,
				latitude,
				longitude,
			} = req.body;
			const user = req.user._id;
			let reg = await Dock.create({
				user,
				name,
				address,
				region,
				notes,
				status,
				coordinates: [latitude, longitude],
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
router.get("/:id", docks.actions.read); // Ver recurso
router.patch(
	"/:id",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput([
		"name",
		"address",
		"region",
		"notes",
		"status",
		"latitude",
		"longitude",
	]),
	async (req, res) => {
		try {
			const id = req.params.id;
			const userId = req.user._id;
			const reg = await Dock.findOne({ _id: id, active: 1 });
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
			const {
				name,
				address,
				region,
				notes,
				status,
				latitude,
				longitude,
			} = req.body;
			reg.name = name;
			reg.address = address;
			reg.region = new ObjectId(region);
			reg.notes = notes;
			reg.status = status;
			reg.coordinates = [latitude, longitude];
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
router.delete("/:id", pre.auth, docks.actions.delete); // Eliminar registro


/* Validaciones */
router.get("/:resId/votes", pre.auth, async (req, res) => {
	try {
		const { resId } = req.params;
		const userId = req.user._id;
		const validates = true;

		const result = await Dock.getValidations(resId, userId);

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

			const result = await Dock.validate(resId, userId, validates);

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

			const result = await Dock.validate(resId, userId, validates);

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
		const resource = await Dock.findById(id)
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
		const dock = await Dock.findById(id);
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
			const dock = await Dock.findById(id);
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
			await Dock.updateOne({ _id: id }, { $push: { pictures: photoId } });
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
			const dock = Dock.findOne(id);
			if (!dock)
				return res.status(404).json({
					message: "Resource not found",
				});
			await Dock.updateOne({ _id: id }, { $pull: { pictures: photoId } });
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
