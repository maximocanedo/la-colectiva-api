'use strict';
import Boat from "../../schemas/Boat";
import { Request, Response } from "express";
import {endpoint} from "../../interfaces/types/Endpoint";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
const list: endpoint = async (req: Request, res: Response): Promise<void> => {
    try {
        const { q, enterprise } = req.query;
        const page: number = parseInt(req.query.p as string) || 0;
        const itemsPerPage: number = parseInt(req.query.itemsPerPage as string) || 10;
        let query = {
            $and: [
                { name: { $regex: q || "", $options: "i" }, active: true },
            ],
        };
        if (enterprise) {
            // @ts-ignore
            query.$and.push({ enterprise: enterprise });
        }
        const result = await Boat.listData(query, { page, itemsPerPage });
        res.status(result.status).json(result.items);
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};
export default list;