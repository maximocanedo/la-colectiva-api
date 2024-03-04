'use strict';
import Boat, {IBoatView} from "../../schemas/Boat";
import { Request, Response } from "express";
import {endpoint} from "../../interfaces/types/Endpoint";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose, {FilterQuery} from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";
import IBoat from "../../interfaces/models/IBoat";
import * as boats from "../../ext/boats";
import pre, {IPaginator} from "../../endpoints/pre";
const list = (enterpriseInBody: boolean = true): endpoint[] => [
    pre.paginate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const q: string = req.query.q as string || "";
            const enterpriseRaw = (enterpriseInBody ? req.query.enterprise as string : req.params.id as string) || "";
            const enterprise: string | undefined = enterpriseRaw === "" || enterpriseRaw === undefined ? undefined : enterpriseRaw;
            const filterByEnterprise: boolean = !enterpriseInBody || (enterpriseInBody && !!enterprise);
            const response: IBoatView[] = await boats.find({ q, paginator: req.paginator as IPaginator, enterprise: filterByEnterprise ? enterprise : undefined });
            res.status(200).json({ data: response }).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
];
export default list;