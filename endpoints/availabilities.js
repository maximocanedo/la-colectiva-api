"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const User = require("../schemas/User");
const pre = require("./pre");
const Path = require("./../schemas/Path");
const Availability = require("../schemas/Availability");
const Boat = require("../schemas/Boat");
const availabilities = require("../actions/availabilities");
const {handleVotes} = require("../schemas/ValidationUtils");
router.use(express.json());
router.use(cookieParser());

router.post(
	"/",
	pre.auth,
	pre.allow.moderator,
	pre.verifyInput(["path", "condition", "available"]),
	async (req, res, next) => {
		const path_obj = Path.findOne({ _id: req.path });
		if (!path_obj)
			return res.status(404).send("Path resource not found.").end();
		else next();
	},
	availabilities.createOne
);
router.get("/:av_id", availabilities.getOne);
router.delete("/:av_id", pre.auth, pre.allow.moderator, availabilities.deleteOne);

/* Validaciones */
handleVotes(router, Availability);

module.exports = router;
