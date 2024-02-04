'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import {Request, Response} from "express";
import WaterBody, {IRegionView} from "../../schemas/WaterBody";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";

const getOne: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            const { status, ...result }: FetchResult<IRegionView> = await WaterBody.listData({
                _id: id,
                active: true
            }, { page: 0, itemsPerPage: 1 });
            if(result.data.length === 0) {
                res.status(404).json({ data: [], error: E.ResourceNotFound }).end();
                return;
            }
            res.status(status).json(result).end();
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ data: [], error }).end();
        }
    }
];

export default getOne;