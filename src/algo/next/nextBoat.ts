'use strict';

import mongoose from "mongoose";

/**
 * Obtener la hora en la que pasa la siguiente embarcación.
 * @param departure ID del muelle de partida.
 * @param arrival ID del muelle de destino.
 * @param time Hora de consulta.
 * @param conditions Array de condiciones.
 */
const nextBoat = (departure: mongoose.Types.ObjectId, arrival: mongoose.Types.ObjectId, time: Date, conditions: any[]): any => ([
    /**
     * Buscamos los horarios que tengan tanto el muelle de partida como el de llegada,
     * Y que tengan una hora mayor o igual a la de consulta.
     */
    {
        $match: {
            $or: [
                { dock: departure },
                { dock: arrival },
            ],
            time: { $gt: time }, // Horarios futuros
        },
    },
    /**
     * Poblamos los registros de los recorridos.
     */
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
    /**
     * Poblamos los registros de embarcaciones.
     */
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
    /**
     * Poblamos los registros de muelles.
     */
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
    /**
     * Poblamos los registros de empresas.
     */
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
            "departureTime": { $arrayElemAt: ["$schedules.time", 0] }, // Hora de salida
            "arrivalTime": { $arrayElemAt: ["$schedules.time", 1] } // Hora de llegada
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
            "timeDifference": 1 // Ordena la diferencia de tiempo de llegada después de la salida de menor a mayor
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

    /**
     * Filtramos según las condiciones.
     */
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

export default nextBoat;