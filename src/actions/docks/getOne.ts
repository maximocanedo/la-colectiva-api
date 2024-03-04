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
import * as docks from "../../ext/docks";
import IUser from "../../interfaces/models/IUser";
const getOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const response: IDockView = await docks.get({ id, responsible: req.user as IUser });
        res.status(200).json({ data: response }).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
};
export default getOne;