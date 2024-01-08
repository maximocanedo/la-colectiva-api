'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response } from "express";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log(34);
        const { prefer, q } = req.query;
        const page: number = parseInt((req.query.p?? 0) as string) || 0;
        const itemsPerPage: number = parseInt((req.query.itemsPerPage?? 10) as string) || 10;
        let preferObj = {
            status: prefer || -1,
        };
        if (parseInt(prefer as string) === -1) {

            preferObj = {
                // @ts-ignore
                status: { $gt: -1 },
            };
        }
        const query = {
            $and: [
                preferObj,
                {
                    name: { $regex: q || "", $options: "i" },
                },
            ],
        };
        let result = await Dock.listData(query, { page, itemsPerPage });

        res.status(result.status).json(result.items);
    } catch (err) {
        if(err instanceof MongoError) {
            const error: IError = mongoErrorMiddleware(err as MongoError);
            res.status(500).json({error}).end();
        } else if(err instanceof mongoose.Error) {
            const error: IError = mongooseErrorMiddleware(err as mongoose.Error);
            res.status(500).json({error}).end();
        } else res.status(500).json({
            error: E.CRUDOperationError
        }).end();
    }
};
export default list;