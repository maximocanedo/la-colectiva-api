[
  {
    $match: {
      $or: [
        {
          dock: ObjectId(
              "64ee579d54394a493a991c89"
          ),
        },
        {
          dock: ObjectId(
              "656257413cf87c69b28b9132"
          ),
        },
      ],
      time: {
        $gt: new ISODate(
            "1990-01-01T09:44:00.000+00:00"
        ),
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
          ObjectId("64ee579d54394a493a991c89"),
          ObjectId("656257413cf87c69b28b9132"),
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
                    ObjectId(
                        "64ee579d54394a493a991c89"
                    ),
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
      "availability.condition": { $in: ["MONDAY"] }
    }
  }





]