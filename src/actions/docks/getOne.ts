'use strict';
import Dock, {IDockView} from "../../schemas/Dock";
import { Request, Response } from "express";
import IValidation from "../../interfaces/models/IValidation";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";
const getOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const { status, ...result }: FetchResult<IDockView> = await Dock.listData(
            { active: true, _id: id },
            { page: 0, itemsPerPage: 1 }
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