'use strict';

const Dock = require("../../schemas/Dock");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const list = async (req, res) => {
    try {
        const { prefer, q } = req.query;
        const page = req.query.p || 0;
        const itemsPerPage = req.query.itemsPerPage || 10;
        let preferObj = {
            status: prefer || -1,
        };
        if (prefer === -1) {
            preferObj = {
                status: { $gt: -1 },
            };
        }
        const query = {
            $and: [
                preferObj,
                {
                    name: { $regex: q || "", $options: "i" },
                },
            ],
        };
        let result = await Dock.listData(query, { page, itemsPerPage });

        return res.status(result.status).json(result.items);
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: new CRUDOperationError().toJSON(),
        });
    }
};
module.exports = list;