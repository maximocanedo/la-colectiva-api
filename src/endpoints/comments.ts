"use strict";

import express, {Request, Response, Router} from "express";
import pre from "./pre";
import Comment from "../schemas/Comment";
import dotenv from "dotenv";
import E from "../errors/index";
import V from "../validators/index";

const router: Router = express.Router();
dotenv.config();
router.use(express.json());

router.post(
	"/",
	pre.auth,
	pre.allow.normal,
	pre.expect({
		content: V.comment.content.required(),
	}),
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { content } = req.body;
			// Utilizar el método add para crear el comentario
			const newComment = await Comment.add(req.user._id, content);
			res.status(201).json({
				message: "Comment created",
				newComment,
			});
		} catch (err) {
			res.status(500).json({ error: E.InternalError });
		}
	}
); // Añadir un comentario

router.get("/:comment_id", async (req: Request, res: Response): Promise<void> => {
	try {
		let { comment_id } = req.params;
		let comment = await Comment.findOne({
			_id: comment_id,
			active: true,
		}).populate({ path: "user", model: "User", select: "name _id" });
		if (!comment) {
			res.status(404).json({ error: E.ResourceNotFound });
		}
		res.status(200).json(comment);
	} catch (err) {
		res.status(500).json({ error: E.InternalError });
	}
}); // Ver contenido de un comentario

router.put("/:comment_id",
	pre.expect({ content: V.comment.content.required() }),
	async (req: Request, res: Response): Promise<void> => {
	try {
		let { comment_id } = req.params;
		let { content } = req.body; // Suponiendo que el cuerpo de la solicitud tiene el nuevo contenido del comentario

		let comment = await Comment.findOne({ _id: comment_id, active: true });

		if (!comment) {
			res.status(404).json({ error: E.ResourceNotFound });
			return;
		}

		comment.content = content;
		comment.__v += 1; // Incrementar manualmente el campo __v

		let updatedComment = await comment.save();

		res.status(200).json(updatedComment);
	} catch (err) {
		res.status(500).json({ error: E.InternalError });
	}
});

router.delete("/:comment_id", pre.auth, pre.allow.normal, async (req: Request, res: Response): Promise<void> => {
	try {
		const { comment_id } = req.params;
		const result = await Comment.delete(comment_id);
		if (!result.success) {
			// TODO Usar errores personalizados
			console.error(result.message);
			res.status(result.status).json({
				message: result.message,
			});
			return;
		}
		res.status(result.status).json({
			message: result.message,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({error: E.InternalError});
	}
}); // Eliminar permanentemente un comentario

export default router;
