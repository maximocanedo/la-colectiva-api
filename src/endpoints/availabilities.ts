"use strict";
require("dotenv").config();
import express, {Request, Response, NextFunction, Router} from "express";
import pre from "./pre";
import Path from "../schemas/Path";
import Availability from "../schemas/Availability";
import availabilities from "../actions/availabilities";
import { handleVotes } from "../utils/Validation.utils";

const router: Router = express.Router();
router.use(express.json());

router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["path", "condition", "available"]),
	async (req: Request, res: Response, next: NextFunction): Promise<void> => {
		const path_obj = Path.findOne({ _id: req.path, active: true });
		if (!path_obj)
			res.status(404).json({
				error: ''
			}).end();
		else next();
	},
	availabilities.createOne
);
router.get("/:av_id", availabilities.getOne);
router.delete("/:av_id", pre.auth, pre.allow.moderator, availabilities.deleteOne);

/* Validaciones */
handleVotes(router, Availability);

export default router;
