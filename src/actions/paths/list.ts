'use strict';
import Path, {IPathView} from "../../schemas/Path";
import { Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
import * as paths from "../../ext/paths";
import {IError} from "../../interfaces/responses/Error.interfaces";
import pre, {IPaginator} from "../../endpoints/pre";
import {endpoint} from "../../interfaces/types/Endpoint";
const list: endpoint[] = [
    pre.paginate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const q: string = req.query.q as string || "";
            const response: IPathView[] = await paths.list({ q, paginator: req.paginator as IPaginator });
            res.status(200).json({ data: response }).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];
export default list;