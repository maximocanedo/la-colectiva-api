"use strict";

import dotenv from "dotenv";
import express, { Router, Request, Response } from "express";
import Schedule from "../schemas/Schedule";
import E from "../errors";
import mongoose from "mongoose";
import nextBoat from "../algo/next/nextBoat";

dotenv.config();
const router: Router = express.Router();

router.use(express.json());

router.get(
	"/next",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const {
				departure,
				arrival,
				time,
				conditions
			} = req.query;
			const date: Date = new Date("1990-01-01T" + time + ":00.000+00:00");
			const result: any[] = await Schedule.aggregate(nextBoat(
				new mongoose.Types.ObjectId(departure as string),
				new mongoose.Types.ObjectId(arrival as string),
				date,
				[ ...(conditions as any[]) ]
			));
			if (!result) {
				res.status(404).json({ error: E.ResourceNotFound});
				return;
			}
			res.status(200).json(result);
		} catch (err) {
			console.error(err);
			res.status(500).json({ error: E.InternalError});
		}
	}
);

export default router;