"use strict";
require("dotenv").config();
const express = require("express");
const multer = require("multer");
const router = express.Router();
const cookieParser = require("cookie-parser");
const User = require("../schemas/User");
const Photo = require("../schemas/Photo");
const pre = require("./pre");
const path = require("path");
const fs = require("fs");
const Comment = require("../schemas/Comment");
router.use(express.json());
router.use(cookieParser());

// Configuración de multer para guardar los archivos en una carpeta
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const destinationPath = path.join(__dirname, "../data/photos/");
		cb(null, destinationPath);
	},
	filename: (req, file, cb) => {
		// Generamos un nombre único para el archivo
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const fileExtension = file.originalname.split(".").pop(); // Obtener la extensión del archivo
		const fileNameWithoutExtension = file.originalname
			.split(".")
			.slice(0, -1)
			.join("-")
			.toLowerCase()
			.split(" ")
			.join("-");
		const finalFileName = `${fileNameWithoutExtension}-${uniqueSuffix}.${fileExtension}`;
		cb(null, finalFileName);
	},
});

// Acciones principales
const upload = multer({ storage: storage });
router.post(
	"/upload",
	pre.authenticate,
	pre.moderatorsCanAccess,
	upload.single("file"),
	async (req, res) => {
		const requiredProps = ["description"];
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
			const archivo = req.file;
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
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
);

router.get("/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const photoDetails = await Photo.getPhotoDetailsById(id);
		if (!photoDetails) {
			return res.status(404).json({
				message: "Image not found",
			});
		}
		res.status(200).json(photoDetails);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
});

router.get("/:id/view", async (req, res) => {
	try {
		const id = req.params.id;
		let pic = await Photo.findById(id);

		if (!pic) {
			return res.status(404).json({
				message: "Image not found",
			});
		}

		let fullRoute = path.join(__dirname, "../data/photos/", pic.filename);

		// Envía la imagen como respuesta
		res.sendFile(fullRoute);
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Ver imagen
router.patch(
	"/:id",
	pre.authenticate,
	pre.moderatorsCanAccess,
	async (req, res) => {
		try {
			const id = req.params.id;
			const username = req.user.username;
			const pic = await Photo.findOne({ _id: id, active: 1 });
			if (!pic) {
				res.status(404).json({
					message: "There's no image with that ID. ",
				});
				return;
			}
			if (pic.user != req.user._id) {
				res.status(403).json({
					message:
						"You can't edit info about an image that other user uploaded. ",
				});
				return;
			}
			if (!req.body.description) {
				res.status(400).json({
					message: "You have to provide a new description. ",
				});
				return;
			}
			const description = req.body.description;
			pic.description = description;
			await pic.save();
			res.status(200).json({
				message: "Description updated. ",
			});
		} catch (err) {
			console.error(err);
			res.status(500).json({
				message: "Internal error. ",
			});
		}
	}
); // Editar pie de imagen
router.delete("/:id", pre.authenticate, async (req, res) => {
	try {
		const id = req.params.id;
		const pic = await Photo.findById(id);
		const username = req.user.username;
		const isAdmin = req.user.role >= 3;
		if (!pic) {
			res.status(404).json({
				message: "There's no photo with the provided ID. ",
			});
			return;
		}
		if (pic.user != req.user._id && !isAdmin) {
			res.status(403).json({
				message: "No image was deleted. ",
			});
			return;
		}
		pic.active = false;
		const status = await pic.save();

		let fullRoute = path.join(__dirname, "../data/photos/", pic.filename);

		// Elimina el archivo
		fs.unlink(fullRoute, (err) => {
			if (err) {
				console.error("Error al eliminar el archivo:", err);
				res.status(500).json({
					message: "Error while trying to delete the file. ",
				});
			} else {
				res.status(200).json({
					message: "File was deleted and data was disabled. ",
				});
			}
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			message: "Internal error. ",
		});
	}
}); // Eliminar imagen
router.get("/protected", pre.authenticate, (req, res) => {
	res.status(200).json({
		message: "Successfully authenticated",
		user: req.user,
	});
}); // Prueba de autenticidad

// Acciones con comentarios
router.get("/:id/comments", async (req, res) => {
	try {
		const photoId = req.params.id;
		const page = req.query.p || 0;
		const itemsPerPage = req.query.itemsPerPage || 10;
		let result = await Photo.listComments({
			photoId,
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
}); // Ver comentarios de la imagen
router.post(
	"/:id/comments",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const photoId = req.params.id;
			const content = req.body.content;
			const userId = req.user._id;

			const result = await Photo.comment(photoId, content, userId);

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
	"/:photoId/comments/:commentId",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const { photoId, commentId } = req.params;
			const photo = await Photo.findById(photoId);
			if (!photo) {
				return res.status(404).json({
					message: "Photo not found",
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
				const commentIndex = photo.comments.indexOf(commentId);
				if (commentIndex !== -1) {
					photo.comments.splice(commentIndex, 1);
					await photo.save();
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

// Validaciones
router.post(
	"/:photoId/validate",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const { photoId } = req.params;
			const userId = req.user._id;
			const validates = true;

			const result = await Photo.validate(photoId, userId, validates);

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
	"/:photoId/invalidate",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const { photoId } = req.params;
			const userId = req.user._id;
			const validates = false;

			const result = await Photo.validate(photoId, userId, validates);

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
