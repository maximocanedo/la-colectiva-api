"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Path = require("../schemas/Path");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const Schedule = require("../schemas/Schedule");
const { ObjectId } = require("mongodb");
const { ISODate } = require("mongoose");

router.use(express.json());
router.use(cookieParser());
// Próxima lancha
let data = {
	dock: "Perla",
	time: {
		hour: 9,
		min: 35,
	},
	conditions: ["MONDAY", "HOLIDAY"],
};

router.get(
	"/next",
	pre.verifyInput(["dock", "time", "conditions"]),
	async (req, res) => {
		try {
			const { dock, time, conditions } = req.body;
			const horaBusqueda = new Date(1990, 0, 1, time.hour, time.min);
			const addZero = (x) => (parseInt(x) < 10 ? `0${x}` : `${x}`);
			let h = addZero(time.hour);
			let m = addZero(time.min);
			const stringHora = horaBusqueda.toISOString();
			const result = await Schedule.aggregate([
				{
					$match: {
						time: {
							$gt: new Date(`Mon, 01 Jan 1990 ${h}:${m}:00 GMT`),
						},
						dock: new ObjectId(dock),
					},
				},
				{
					$lookup: {
						from: "paths",
						localField: "path",
						foreignField: "_id",
						as: "pathInfo",
						pipeline: [
							{
								$project: {
									_id: 1,
									title: 1,
									boat: 1,
								},
							},
						],
					},
				},
				{
					$unwind: "$pathInfo",
				},
				{
					$lookup: {
						from: "availabilities",
						localField: "pathInfo._id",
						foreignField: "path",
						as: "availabilityInfo",
						pipeline: [
							{
								$project: {
									_id: 1,
									condition: 1,
									available: 1,
								},
							},
						],
					},
				},
				{
					$match: {
						"availabilityInfo.condition": {
							$in: conditions,
						},
						"availabilityInfo.available": true,
					},
				},
			]);

			if (!result) {
				return res.status(404).json({
					message: "No schedules found",
				});
			}
			res.status(200).json(result);
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal error. " });
		}
	}
);

module.exports = router;
