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
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const prefer: number = parseInt(req.query.prefer as string || "-1");
        const q: string = req.query.q as string || "";
        const page: number = parseInt((req.query.p?? 0) as string) || 0;
        const itemsPerPage: number = parseInt((req.query.itemsPerPage?? 10) as string) || 10;
        let preferObj: any = {
            status: prefer || -1,
        };
        if (prefer === -1) {
            preferObj = {
                // @ts-ignore
                status: { $gt: -1 },
            };
        }
        preferObj = {
            ...preferObj,
            active: true
        }
        const query = {
            $and: [
                preferObj,
                {
                    name: { $regex: q || "", $options: "i" },
                },
            ],
        };
        const { status, ...result }: FetchResult<IDockView> = await Dock.listData(query, { page, itemsPerPage });
        res.status(status).json(result);
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};
export default list;