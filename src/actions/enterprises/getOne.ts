'use strict';

import {Request, Response} from "express";
import Enterprise, {IEnterpriseView} from "../../schemas/Enterprise";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
const getOne = async (req: Request, res: Response) => {
    try {
        const { status, ...result }: FetchResult<IEnterpriseView> = await Enterprise.listData(
            { active: true, _id: req.params.id }
        , { page: 0, itemsPerPage: 1 });
        if(result.data.length === 0) {
            res.status(404).json({ error: E.ResourceNotFound, data: [] }).end();
            return;
        }
        res.status(status).json(result);
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
};
export default getOne;