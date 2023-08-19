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
			const archivo = req.file; // Aquí está la información del archivo subido
			const otrosDatos = req.body; // Aquí estarán otros datos del formulario si los tienes
			const { filename } = archivo;
			const { description } = otrosDatos;
			const username = req.user.username;
			let pic = new Photo({
				filename,
				username,
				description,
			});

			let pics = pic.save();
			res.status(201).json({
				id: pics._id,
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
		// Utiliza findOne para buscar una foto con ID y active: true
		let pic = await Photo.findOne({ _id: id, active: true });

		if (!pic) {
			return res.status(404).json({
				message: "Image not found",
			});
		}

		let fullRoute = path.join(__dirname, "../data/photos/", pic.filename);

		// Envía la imagen como respuesta
		res.status(200).json({
			url: `/photos/${id}/view`,
			username: pic.username,
			description: pic.description,
			uploadDate: pic.uploadDate,
		});
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
});
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
			console.log({
				picsusername: pic.username,
				username,
			});
			if (pic.username != username) {
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
);
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
		if (pic.username != username && !isAdmin) {
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
});
router.get("/protected", pre.authenticate, (req, res) => {
	res.status(200).json({
		message: "Successfully authenticated",
		user: req.user,
	});
});

module.exports = router;
