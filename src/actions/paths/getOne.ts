'use strict';
import Path, {IPathView} from "../../schemas/Path";
import {Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
const getOne = [async (req: Request, res: Response): Promise<void> => {
    try {
        const _id: string = req.params.id;
        const query = { active: true, _id };
        const { status, ...result }: FetchResult<IPathView> = await Path.listData(query, { page: 0, size: 1 });
        if(result.data.length === 0) {
            res.status(404).json({ data: [], error: E.ResourceNotFound }).end();
            return;
        }
        res.status(status).json(result).end();
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ data: [], error });
    }
}];
export default getOne;