'use strict';

import {Request, Response} from "express";
import WaterBody, {IRegionView} from "../../schemas/WaterBody";
import E from "../../errors";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";

const list: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const q: string = req.query.q as string || "";
            const page: number = parseInt(req.query.p as string) || 0;
            const itemsPerPage: number = parseInt(req.query.itemsPerPage as string) || 10;
            const { status, ...result }: FetchResult<IRegionView> = await WaterBody.listData({
                active: true,
                name: { $regex: q, $options: "i" }
            }, { page, itemsPerPage });
            res.status(status).json(result);
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error, data: [] });
        }

    }
];

export default list;