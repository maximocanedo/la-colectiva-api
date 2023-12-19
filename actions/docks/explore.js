'use strict';

const Dock = require("../../schemas/Dock");
const explore = async (res, req) => {
    try {
        const { lat, lng, radio } = req.params;
        const { prefer, q } = req.query;
        let coordinates = [lat, lng];
        const page = req.query.p || 0;
        const itemsPerPage = req.query.itemsPerPage || 10;
        let preferObj = {
            status: prefer,
            name: { $regex: q || "", $options: "i" },
        };
        if (prefer == -1) {
            preferObj = {
                status: { $gt: -1 },
                name: { $regex: q || "", $options: "i" },
            };
        }
        const query = {
            $and: [
                {
                    coordinates: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [...coordinates], // [longitud, latitud]
                            },
                            $maxDistance: radio,
                        },
                    },
                },
                preferObj,
            ],
        };
        let result = await Dock.listData(query, {
            page,
            itemsPerPage,
        });

        res.status(result.status).json(result.items);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal error",
        });
    }
};
module.exports = explore;