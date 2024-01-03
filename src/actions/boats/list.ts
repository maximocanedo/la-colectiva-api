'use strict';
import Boat from "../../schemas/Boat";
import { Request, Response } from "express";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, enterprise } = req.query;
        const page = parseInt(req.query.p as string) || 0;
        const itemsPerPage = parseInt(req.query.itemsPerPage as string) || 10;


        let query = {
            $and: [
                { name: { $regex: q || "", $options: "i" } },
            ],
        };

        if (enterprise) {
            // @ts-ignore
            query.$and.push({ enterprise: enterprise });
        }

        const result = await Boat.listData(query, { page, itemsPerPage });

        res.status(result.status).json(result.items);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()',
        }).end();
    }
};
export default list;