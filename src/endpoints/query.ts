"use strict";

import dotenv from "dotenv";
import express, { Router, Request, Response } from "express";
import Schedule from "../schemas/Schedule";
import E from "../errors";
import mongoose from "mongoose";
import nextBoat, {NextBoatResponse, NextSchedule} from "../algo/next/nextBoat.2.0";

dotenv.config();
const router: Router = express.Router();

router.use(express.json());

router.get(
	"/next",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const departure: string = req.query.departure as string;
			const arrival: string = req.query.arrival as string;
			const time: string = req.query.time as string;
			const conditions: string[] = req.query.conditions as string[];

			const date: Date = new Date("1990-01-01T" + time + ":00.000+00:00");
			const algo: any[] = nextBoat(
				new mongoose.Types.ObjectId(departure as string),
				new mongoose.Types.ObjectId(arrival as string),
				date,
				[ ...(conditions as any[]) ]
			);
			let result: NextBoatResponse[] = await Schedule.aggregate(algo) as NextBoatResponse[];
			if (!result) {
				res.status(404).json({ error: E.ResourceNotFound});
				return;
			}
			for(let i: number = 0; i < result.length; i++) {
				let sample: NextBoatResponse = result[i];
				for(let j: number = 0; j < sample.schedules.length; j++) {
					let schedule: NextSchedule = sample.schedules[j];
					let rawTime: string = schedule.time;
					let formatted: Date = new Date(rawTime);
					const hours: number = formatted.getUTCHours();
					const minutes: number = formatted.getUTCMinutes();
					result[i].schedules[j].time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
				}
			}
			res.status(200).json({ data: [ ...result ], error: null });
		} catch (err) {
			console.error(err);
			res.status(500).json({ data: [], error: E.InternalError});
		}
	}
);

export default router;