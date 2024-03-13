'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response, NextFunction } from "express";
import E from "./../../errors"
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import defaultHandler from "../../errors/handlers/default.handler";
import * as docks from "../../ext/docks";
import IUser from "../../interfaces/models/IUser";
import {endpoint} from "../../interfaces/types/Endpoint";
const deleteOne: endpoint = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        await docks.enable({ id, responsible: req.user as IUser });
        res.status(204).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
};

export default deleteOne;