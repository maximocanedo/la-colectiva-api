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
	pre.auth,
	pre.allow.normal,
	pre.verifyInput(["content"]),
	async (req, res) => {
		try {
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
		let comment = await Comment.findOne({
			_id: comment_id,
			active: true,
		}).populate({ path: "user", model: "User", select: "name _id" });
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
router.put("/:comment_id", async (req, res) => {
	try {
		let { comment_id } = req.params;
		let { content } = req.body; // Suponiendo que el cuerpo de la solicitud tiene el nuevo contenido del comentario

		let comment = await Comment.findOne({ _id: comment_id, active: true });

		if (!comment) {
			return res.status(404);
		}

		comment.content = content;
		comment.__v += 1; // Incrementar manualmente el campo __v

		let updatedComment = await comment.save();

		res.status(200).json(updatedComment);
	} catch (err) {
		res.status(500).json({
			message: "Internal error",
		});
	}
});

router.delete("/:comment_id", pre.auth, pre.allow.normal, async (req, res) => {
	try {
		const { comment_id } = req.params;
		const result = await Comment.delete(comment_id);
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
}); // Eliminar permanentemente un comentario

module.exports = router;
