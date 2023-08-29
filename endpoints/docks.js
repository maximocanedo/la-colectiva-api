"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Dock = require("../schemas/Dock");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const { ObjectId } = require("mongodb");

router.use(express.json());
router.use(cookieParser());

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
				const { prefer, q } = req.body;
				const page = req.query.p || 0;
				const itemsPerPage = req.query.itemsPerPage || 10;
				let preferObj = {
					status: prefer,
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
		create: async (req, res) => {
			const requiredProps = [
				"name",
				"address",
				"region",
				"notes",
				"status",
				"latitude",
				"longitude",
			];
			const missingProps = requiredProps.filter(
				(prop) => !(prop in req.body)
			);
			if (missingProps.length > 0) {
				return res.status(400).json({
					message: `Missing required properties: ${missingProps.join(
						", "
					)}`,
				});
			}
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
		update: async (req, res) => {
			const requiredProps = [
				"name",
				"address",
				"region",
				"notes",
				"status",
				"latitude",
				"longitude",
			];
			const missingProps = requiredProps.filter(
				(prop) => !(prop in req.body)
			);
			if (missingProps.length > 0) {
				return res.status(400).json({
					message: `Missing required properties: ${missingProps.join(
						", "
					)}`,
				});
			}
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
	pre.authenticate,
	pre.moderatorsCanAccess,
	docks.actions.create
); // Crear un registro
router.get("/:id", docks.actions.read); // Ver recurso
router.patch(
	"/:id",
	pre.authenticate,
	pre.moderatorsCanAccess,
	docks.actions.update
); // Editar recurso
router.delete("/:id", pre.authenticate, docks.actions.delete); // Eliminar registro

/* Comentarios */
router.get("/:id/comments", async (req, res) => {
	try {
		const resId = req.params.id;
		const page = req.query.p || 0;
		const itemsPerPage = req.query.itemsPerPage || 10;
		let result = await Dock.listComments({
			resId,
			page,
			itemsPerPage,
		});
		res.status(result.status).json(result);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Ver comentarios del recurso
router.post(
	"/:id/comments",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const resId = req.params.id;
			const content = req.body.content;
			const userId = req.user._id;

			const result = await Dock.comment(resId, content, userId);

			if (result.error) {
				console.error(result.error);
				return res.status(500).json({
					message: result.msg,
				});
			}

			res.status(201).json({
				message: "Comment added",
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Publicar comentario
router.delete(
	"/:resId/comments/:commentId",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const { resId, commentId } = req.params;
			const resource = await Dock.findById(resId);
			if (!resource) {
				return res.status(404).json({
					message: "Resource not found",
				});
			}
			const comment = await Comment.findById(commentId);
			if (!comment) {
				return res.status(404).json({
					message: "Comment not found",
				});
			}
			if (comment.user == req.user._id || req.user.role >= 2) {
				// Eliminar el comentario de la colección Comment
				await Comment.delete(commentId);

				// Eliminar la referencia del comentario en el arreglo comments de la foto
				const commentIndex = resource.comments.indexOf(commentId);
				if (commentIndex !== -1) {
					resource.comments.splice(commentIndex, 1);
					await resource.save();
				}
				return res.status(200).json({
					message: "Comment deleted",
				});
			} else
				return res.status(403).json({
					message: "Unauthorized. ",
				});
		} catch (err) {
			console.error(err);
			return res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Eliminar comentario

/* Validaciones */
router.post(
	"/:resId/validate",
	pre.authenticate,
	pre.normalUsersCanAccess,
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
	pre.authenticate,
	pre.normalUsersCanAccess,
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
router.get("/:id/photos/", async (req, res) => {});
router.post(
	"/:id/photos/",
	pre.authenticate,
	pre.moderatorsCanAccess,
	async (req, res) => {}
);
router.delete(
	"/:id/photos/",
	pre.authenticate,
	pre.moderatorsCanAccess,
	async (req, res) => {}
);

module.exports = router;
