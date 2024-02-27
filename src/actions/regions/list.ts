'use strict';

import {Request, Response} from "express";
import WaterBody, {IRegionView} from "../../schemas/WaterBody";
import E from "../../errors";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";
import pre, {IPaginator} from "../../endpoints/pre";
import * as regions from "./../../ext/regions";
import {IError} from "../../interfaces/responses/Error.interfaces";

const list: endpoint[] = [
    pre.paginate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const q: string = req.query.q as string || "";
            const paginator: IPaginator = req.paginator as IPaginator;
            const { status, ...result }: FetchResult<IRegionView> = await regions.find({ q, paginator });
            res.status(status).json(result);
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }

    }
];

export default list;