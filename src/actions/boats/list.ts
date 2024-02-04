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
const list = (enterpriseInBody: boolean = true): endpoint[] => [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const q: string = req.query.q as string || "";
            const enterprise: string = (enterpriseInBody ? req.query.enterprise as string : req.params.id as string) || "";
            const page: number = parseInt(req.query.p as string) || 0;
            const size: number = parseInt(req.query.itemsPerPage as string) || 10;
            const filterByEnterprise: boolean = !enterpriseInBody || (enterpriseInBody && !!enterprise);
            const query: FilterQuery<IBoat> = {
                $and: [
                    {
                        $or: [
                            { name: { $regex: q || "", $options: "i" }, active: true },
                            { mat: { $regex: q || "", $options: "i" }, active: true },
                        ]
                    },
                    ...(filterByEnterprise ? [{ enterprise }] : [])
                ],
            };
            const { status, ...result }: FetchResult<IBoatView> = await Boat.listData(query, { page, size });
            res.status(status).json(result);
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error, data: [] });
        }
    }
];
export default list;