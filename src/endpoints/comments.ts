"use strict";
import express, {Request, Response, Router} from "express";
import dotenv from "dotenv";
import comments from "../actions/comments";

const router: Router = express.Router();
dotenv.config();
router.use(express.json());

router
	.post("/", async (req: Request, res: Response): Promise<void> => {
		res.status(405).end();
	})
	.get("/:id", comments.getOne)
	.put("/:id", comments.edit);

export default router;
