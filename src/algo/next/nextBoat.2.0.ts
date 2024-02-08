import mongoose from "mongoose";

export interface NextSchedule {
    _id: string,
    time: string,
    path: string,
    dock: string,
    user: string,
    uploadDate: Date | string,
    __v: number,
    active: boolean
}
export interface NextBoatResponse {
    _id: string,
    duration: number,
    schedules: NextSchedule[],
    available: string[],
    path: {
        title: string,
        description: string,
        boat: {
            _id: string,
            name: string,
            mat: string,
            status: boolean,
        },
    },
    enterprise: {
        _id: string,
        name: string,
        cuit: number,
    }
}

const nextBoat = (departure: mongoose.Types.ObjectId, arrival: mongoose.Types.ObjectId, time: Date, conditions: any[]): any[] => ([
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
            },
        },
    },
    {
        $project: {
            _id: 1,
            time: 1,
            path: 1,
            dock: 1,
            user: 1,
            uploadDate: 1,
            __v: 1,
            active: 1,
        },
    },
    {
        $sort: {
            time: 1,
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
        $addFields: {
            hasDeparture: {
                $gt: [
                    {
                        $size: {
                            $filter: {
                                input: "$schedules",
                                cond: {
                                    $eq: [
                                        "$$this.dock",
                                        departure,
                                    ],
                                },
                            },
                        },
                    },
                    0,
                ],
            },
            hasArrival: {
                $gt: [
                    {
                        $size: {
                            $filter: {
                                input: "$schedules",
                                cond: {
                                    $eq: [
                                        "$$this.dock",
                                        arrival,
                                    ],
                                },
                            },
                        },
                    },
                    0,
                ],
            },
        },
    },
    {
        $match: {
            hasDeparture: true,
            hasArrival: true,
        },
    },
    {
        $addFields: {
            schedules: {
                $map: {
                    input: {
                        $slice: [
                            {
                                $map: {
                                    input: "$schedules",
                                    as: "schedule",
                                    in: {
                                        time: "$$schedule.time",
                                        schedule: "$$schedule",
                                    },
                                },
                            },
                            {
                                $size: "$schedules",
                            },
                        ],
                    },
                    as: "schedule",
                    in: "$$schedule.schedule",
                },
            },
        },
    },
    {
        $project: {
            _id: 1,
            schedules: 1,
        },
    },
    {
        $project: {
            _id: 1,
            schedules: {
                $map: {
                    input: {
                        $range: [
                            0,
                            {
                                $size: "$schedules",
                            },
                        ],
                    },
                    as: "index",
                    in: {
                        $arrayElemAt: [
                            "$schedules",
                            "$$index",
                        ],
                    },
                },
            },
        },
    },
    {
        $addFields: {
            departure: {
                $arrayElemAt: [
                    {
                        $filter: {
                            input: "$schedules",
                            cond: {
                                $eq: [
                                    "$$this.dock",
                                    departure,
                                ],
                            },
                        },
                    },
                    0,
                ],
            },
            arrival: {
                $arrayElemAt: [
                    {
                        $filter: {
                            input: "$schedules",
                            cond: {
                                $eq: [
                                    "$$this.dock",
                                    arrival,
                                ],
                            },
                        },
                    },
                    0,
                ],
            },
        },
    },
    {
        $match: {
            $expr: {
                $gte: [
                    "$arrival.time",
                    "$departure.time",
                ],
            },
        },
    },
    {
        $project: {
            _id: 1,
            schedules: ["$departure", "$arrival"],
        },
    },
    {
        $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
            {
                from: "paths",
                localField: "_id",
                foreignField: "_id",
                as: "path",
            },
    },
    {
        $unwind: "$path",
    },
    {
        $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
            {
                from: "boats",
                localField: "path.boat",
                foreignField: "_id",
                as: "path.boat",
            },
    },
    {
        $unwind: "$path.boat",
    },
    {
        $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
            {
                from: "enterprises",
                localField: "path.boat.enterprise",
                foreignField: "_id",
                as: "enterprise",
            },
    },
    {
        $unwind: "$enterprise",
    },
    {
        $addFields: {
            departureTime: time,
            // Hora de salida
            arrivalTime: {
                $arrayElemAt: ["$schedules.time", 1],
            }, // Hora de llegada
        },
    },
    {
        $addFields: {
            duration: {
                $subtract: [
                    "$arrivalTime",
                    "$departureTime",
                ],
            },
        },
    },
    {
        $match: {
            duration: {
                $gte: 0,
            }, // Filtra cuando la llegada sea después o igual a la salida
        },
    },
    {
        $sort: {
            duration: 1, // Ordena la diferencia de tiempo de llegada después de la salida de menor a mayor
        },
    },
    {
        $lookup: {
            from: "availabilities",
            let: {
                pathId: "$_id",
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ["$path", "$$pathId"],
                        },
                        available: true,
                    },
                },
                {
                    $group: {
                        _id: "$path",
                        availableDays: {
                            $push: "$condition",
                        },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        available: "$availableDays",
                    },
                },
            ],
            as: "availabilities",
        },
    },
    {
        $project:
            {
                _id: 1,
                schedules: 1,
                duration: 1,
                available: {
                    $arrayElemAt: [
                        "$availabilities.available",
                        0,
                    ],
                },
                path: {
                    title: 1,
                    description: 1,
                    boat: {
                        _id: 1,
                        name: 1,
                        mat: 1,
                        status: 1,
                    },
                },
                enterprise: {
                    _id: 1,
                    name: 1,
                    cuit: 1,
                },
            },
    },
    {
        $match: {
            available: {
                $in: [ ...conditions ],
            },
        },
    }
]);

export default nextBoat;