import mongoose from "mongoose";

const nextBoat = (departure: mongoose.Types.ObjectId, arrival: mongoose.Types.ObjectId, time: string | number, conditions: any[]) => ([
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

export default { legacy: nextBoat };