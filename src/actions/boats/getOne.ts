'use strict';
import Boat, {IBoatView} from "../../schemas/Boat";
import { Request, Response } from "express";
import IBoat from "../../interfaces/models/IBoat";
import IUser from "../../interfaces/models/IUser";
import {endpoint} from "../../interfaces/types/Endpoint";
import E from "../../errors/index";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import defaultHandler from "../../errors/handlers/default.handler";
import Fetch from "../comments/fetch";
import FetchResult from "../../interfaces/responses/FetchResult";
const getOne: endpoint = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const { status, ...result }: FetchResult<IBoatView> = await Boat.listData(
            { active: true, _id: id },
            { page: 0, size: 1 }
        );
        if (result.data.length === 0) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            return;
        }
        res.status(status).json(result).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error, data: [] });
    }
};
export default getOne;