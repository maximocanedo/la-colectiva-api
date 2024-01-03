"use strict";

import dotenv from "dotenv";
import express, { Router, Request, Response } from "express";
import Schedule from "../schemas/Schedule";
import {ObjectId} from "mongodb";


dotenv.config();
const router: Router = express.Router();

router.use(express.json());
// Próxima lancha
let data = {
	dock: "Perla",
	time: {
		hour: 9,
		min: 35,
	},
	conditions: ["MONDAY", "HOLIDAY"],
};
/*const departure = new ObjectId("64ee579d54394a493a991c89");
const arrival = new ObjectId("656257413cf87c69b28b9132");
const time = new ISODate(
	"1990-01-01T09:44:00.000+00:00"
);
const conditions = ["WEDNESDAY"];*/

const Oldalgo = (departure: ObjectId, arrival: ObjectId, time: string | number, conditions: any[]) => ([
	{
		$match: {
			$or: [
				{
					dock: departure,
				},
				{
					dock: arrival,
				},
			],
			time: {
				$gt: time,
			}, // Horarios futuros
		},
	},
	{
		$group: {
			_id: "$path",
			schedules: {
				$push: "$$ROOT",
			},
		},
	},

	{
		$match: {
			"schedules.dock": {
				$all: [
					departure,
					arrival,
				],
			},
		},
	},
	{
		$addFields: {
			sortedSchedules: {
				$map: {
					input: "$schedules",
					as: "schedule",
					in: {
						$mergeObjects: [
							"$$schedule",
							{
								isDeparture: {
									$eq: [
										"$$schedule.dock",
										departure,
									],
								},
							},
						],
					},
				},
			},
		},
	},
	{
		$unwind: "$sortedSchedules",
	},
	{
		$sort: {
			_id: 1,
			"sortedSchedules.isDeparture": -1,
			"sortedSchedules.time": -1,
		},
	},
	{
		$group: {
			_id: "$_id",
			schedules: {
				$push: "$sortedSchedules",
			},
		},
	},
	{
		$addFields: {
			filteredSchedules: {
				$filter: {
					input: "$schedules",
					as: "schedule",
					cond: {
						$ne: [
							"$$schedule.sortedSchedules",
							null,
						],
					},
				},
			},
		},
	},
	{
		$project: {
			_id: 1,
			schedules: "$filteredSchedules",
		},
	},
	{
		$addFields: {
			validSchedules: {
				$filter: {
					input: "$schedules",
					as: "schedule",
					cond: {
						$or: [
							{
								$eq: [
									"$$schedule.isDeparture",
									true,
								],
							},
							{
								$gte: [
									"$$schedule.time",
									{
										$max: {
											$filter: {
												input: "$schedules",
												as: "inner",
												cond: {
													$eq: [
														"$$inner.isDeparture",
														false,
													],
												},
											},
										},
									},
								],
							},
						],
					},
				},
			},
		},
	},
	{
		$project: {
			_id: 1,
			schedules: "$validSchedules",
		},
	},
	{
		$unwind: "$schedules"
	},
	{
		$sort: {
			_id: 1,
			"sortedSchedules.isDeparture": -1,
			"sortedSchedules.time": -1,
			"schedules.arrivalTimeDiff": 1 // Orden ascendente por la diferencia de tiempo de llegada
		}
	},
	{
		$group: {
			_id: "$_id",
			schedules: {
				$push: "$schedules"
			}
		}
	},
	{
		$project: {
			_id: 1,
			schedules: 1,
		}
	},
	{
		$addFields: {
			"departureTime": { $arrayElemAt: ["$schedules.time", 0] }, // Accede al tiempo de salida
			"arrivalTime": { $arrayElemAt: ["$schedules.time", 1] } // Accede al tiempo de llegada
		}
	},
	{
		$addFields: {
			"timeDifference": { $subtract: ["$arrivalTime", "$departureTime"] }
		}
	},
	{
		$match: {
			"timeDifference": { $gte: 0 } // Filtra cuando la llegada sea después o igual a la salida
		}
	},
	{
		$sort: {
			"timeDifference": 1 // Ordenar la diferencia de tiempo de llegada después de la salida de menor a mayor
		}
	},
	{
		$lookup: {
			from: "availabilities",
			localField: "_id",
			foreignField: "path",
			as: "availability"
		}
	},

	// Etapa para descomponer el array de condiciones y filtrar por ellos
	{
		$unwind: "$availability"
	},
	{
		$match: {
			"availability.condition": { $in: conditions },
			"availability.available": true
		}
	},


]);
const algo = (departure: ObjectId, arrival: ObjectId, time: string | number, conditions: any[]): any => ([
	{
		$match: {
			$or: [
				{ dock: departure },
				{ dock: arrival },
			],
			time: { $gt: time }, // Horarios futuros
		},
	},
	{
		$lookup: {
			from: "paths",
			localField: "path",
			foreignField: "_id",
			as: "populatedPath"
		}
	},
	{
		$unwind: "$populatedPath"
	},
	{
		$lookup: {
			from: "boats",
			localField: "populatedPath.boat",
			foreignField: "_id",
			as: "populatedBoat"
		}
	},
	{
		$unwind: "$populatedBoat"
	},
	{
		$lookup: {
			from: "docks",
			localField: "dock",
			foreignField: "_id",
			as: "populatedDock"
		}
	},
	{
		$unwind: "$populatedDock"
	},
	{
		$lookup: {
			from: "enterprises",
			localField: "populatedBoat.enterprise",
			foreignField: "_id",
			as: "populatedEnterprise"
		}
	},
	{ $unwind: "$populatedEnterprise" },
	{
		$group: {
			_id: "$path",
			schedules: {
				$push: "$$ROOT",
			},
		},
	},

	{
		$match: {
			"schedules.dock": {
				$all: [
					departure,
					arrival,
				],
			},
		},
	},
	{
		$addFields: {
			sortedSchedules: {
				$map: {
					input: "$schedules",
					as: "schedule",
					in: {
						$mergeObjects: [
							"$$schedule",
							{
								isDeparture: {
									$eq: [
										"$$schedule.dock",
										departure,
									],
								},
							},
						],
					},
				},
			},
		},
	},
	{
		$unwind: "$sortedSchedules",
	},
	{
		$sort: {
			_id: 1,
			"sortedSchedules.isDeparture": -1,
			"sortedSchedules.time": -1,
		},
	},
	{
		$group: {
			_id: "$_id",
			schedules: {
				$push: "$sortedSchedules",
			},
		},
	},
	{
		$addFields: {
			filteredSchedules: {
				$filter: {
					input: "$schedules",
					as: "schedule",
					cond: {
						$ne: [
							"$$schedule.sortedSchedules",
							null,
						],
					},
				},
			},
		},
	},
	{
		$project: {
			_id: 1,
			schedules: "$filteredSchedules",
		},
	},
	{
		$addFields: {
			validSchedules: {
				$filter: {
					input: "$schedules",
					as: "schedule",
					cond: {
						$or: [
							{
								$eq: [
									"$$schedule.isDeparture",
									true,
								],
							},
							{
								$gte: [
									"$$schedule.time",
									{
										$max: {
											$filter: {
												input: "$schedules",
												as: "inner",
												cond: {
													$eq: [
														"$$inner.isDeparture",
														false,
													],
												},
											},
										},
									},
								],
							},
						],
					},
				},
			},
		},
	},
	{
		$project: {
			_id: 1,
			schedules: "$validSchedules",
		},
	},
	{
		$unwind: "$schedules"
	},
	{
		$sort: {
			_id: 1,
			"sortedSchedules.isDeparture": -1,
			"sortedSchedules.time": -1,
			"schedules.arrivalTimeDiff": 1 // Orden ascendente por la diferencia de tiempo de llegada
		}
	},
	{
		$group: {
			_id: "$_id",
			schedules: {
				$push: "$schedules"
			}
		}
	},
	{
		$project: {
			_id: 1,
			schedules: 1,
		}
	},
	{
		$addFields: {
			"departureTime": { $arrayElemAt: ["$schedules.time", 0] }, // Accede al tiempo de salida
			"arrivalTime": { $arrayElemAt: ["$schedules.time", 1] } // Accede al tiempo de llegada
		}
	},
	{
		$addFields: {
			"timeDifference": { $subtract: ["$arrivalTime", "$departureTime"] }
		}
	},
	{
		$match: {
			"timeDifference": { $gte: 0 } // Filtra cuando la llegada sea después o igual a la salida
		}
	},
	{
		$sort: {
			"timeDifference": 1 // Ordenar la diferencia de tiempo de llegada después de la salida de menor a mayor
		}
	},
	{
		$lookup: {
			from: "availabilities",
			localField: "_id",
			foreignField: "path",
			as: "availability"
		}
	},

	// Etapa para descomponer el array de condiciones y filtrar por ellos
	{
		$unwind: "$availability"
	},
	{
		$match: {
			"availability.condition": { $in: conditions },
			"availability.available": true
		}
	},
]);



router.get(
	"/next",
	async (req: Request, res: Response): Promise<void> => {
		try {
			const { departure, arrival, time, conditions } = req.query;

			const stringHora = new Date("1990-01-01T" + time + ":00.000+00:00");
			const result: any[] = await Schedule.aggregate(algo(
				new ObjectId(departure as string),
				new ObjectId(arrival as string),
				stringHora + "",
				[ ...(conditions as any[]) ]
			));

			if (!result) {
				res.status(404).json({
					message: "No schedules found",
				});
				return;
			}
			res.status(200).json(result);
		} catch (err) {
			console.error(err);
			res.status(500).json({ message: "Internal error. " });
		}
	}
);

export default router;
