'use strict';

const Boat = require("../../schemas/Boat");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const list = async (req, res) => {
    try {
        const { q, enterprise } = req.query;
        const page = parseInt(req.query.p) || 0;
        const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;


        let query = {
            $and: [
                { name: { $regex: q || "", $options: "i" } },
            ],
        };

        if (enterprise) {
            query.$and.push({ enterprise: enterprise });
        }

        const result = await Boat.listData(query, { page, itemsPerPage });

        return res.status(result.status).json(result.items);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: new CRUDOperationError().toJSON(),
        }).end();
    }
};
module.exports = list;