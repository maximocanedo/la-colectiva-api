'use strict';
import Dock, {IDockView} from "../../schemas/Dock";
import { Request, Response } from "express";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";
import * as docks from "../../ext/docks";
import pre, {IPaginator} from "../../endpoints/pre";
import {endpoint} from "../../interfaces/types/Endpoint";
import {DockPropertyStatus} from "../../interfaces/models/IDock";
const list: endpoint[] = [pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const prefer: number = parseInt(req.query.prefer as string || "-1");
        const q: string = req.query.q as string || "";
        const response: IDockView[] = await docks.find({ q, paginator: req.paginator as IPaginator, prefer: prefer as DockPropertyStatus });
        res.status(200).json({ data: response }).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
}];
export default list;