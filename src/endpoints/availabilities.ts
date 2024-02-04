"use strict";
import express, { Router } from "express";
import pre from "./pre";
import Availability from "../schemas/Availability";
import availabilities from "../actions/availabilities";
import { handleVotes } from "../utils/Validation.utils";
import dotenv from "dotenv";

dotenv.config();
const router: Router = express.Router();
router.use(express.json());

router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	availabilities.createOne(true)
);
router.get("/:id", availabilities.getOne);
router.delete("/:avid", pre.auth, pre.allow.moderator, availabilities.deleteOne);

/* Validaciones */
handleVotes(router, Availability);

export default router;
