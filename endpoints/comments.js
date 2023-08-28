"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const User = require("../schemas/User");
const pre = require("./pre");
const path = require("path");
const fs = require("fs");
const Comment = require("./../schemas/Comment");
router.use(express.json());
router.use(cookieParser());

router.post(
	"/",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			// Verificar si todas las propiedades requeridas están presentes en req.body
			const requiredProps = ["content"];
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
			const { content } = req.body;

			// Utilizar el método add para crear el comentario
			const newComment = await Comment.add(req.user._id, content);

			res.status(201).json({
				message: "Comment created",
				newComment,
			});
		} catch (err) {
			res.status(500).json({
				message: "Internal error",
			});
		}
	}
); // Añadir un comentario
router.get("/:comment_id", async (req, res) => {
	try {
		let { comment_id } = req.params;
		let comment = await Comment.findOne({ _id: comment_id, active: true });
		if (!comment) {
			return res.status(404).json({
				message: "Comment not found. ",
			});
		}
		res.status(200).json(comment);
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
}); // Ver contenido de un comentario
router.delete(
	"/:comment_id",
	pre.authenticate,
	pre.normalUsersCanAccess,
	async (req, res) => {
		try {
			const commentId = req.params.commentId;
			const result = await Comment.delete(commentId);
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
); // Eliminar permanentemente un comentario
module.exports = router;
