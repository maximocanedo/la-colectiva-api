'use strict';
import {IEnterpriseView} from "../../schemas/Enterprise";
import { Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as enterprises from "./../../ext/enterprises";
import pre, {IPaginator} from "../../endpoints/pre";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {endpoint} from "../../interfaces/types/Endpoint";

const list: endpoint[] = [ pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const data: IEnterpriseView[] = await enterprises.find(
            { q: req.body.q?? "", paginator: req.paginator as IPaginator }
        );
        res.status(200).json({ data });
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error, data: [] });
    }
}];
export default list;