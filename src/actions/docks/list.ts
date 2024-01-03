'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response } from "express";
const list = async (req: Request, res: Response) => {
    try {
        const { prefer, q } = req.query;
        const page: number = parseInt((req.query.p?? 0) as string) || 0;
        const itemsPerPage: number = parseInt((req.query.itemsPerPage?? 10) as string) || 10;
        let preferObj = {
            status: prefer || -1,
        };
        if (parseInt(prefer as string) === -1) {

            preferObj = {
                // @ts-ignore
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

        res.status(result.status).json(result.items);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON(),'
        });
    }
};
export default list;