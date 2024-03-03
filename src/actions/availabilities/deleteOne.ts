"use strict";
import Availability from "../../schemas/Availability";
import { Request, Response } from "express";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../../errors";
import * as Mongoose from "mongoose";
import mongoose from "mongoose";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import defaultHandler from "../../errors/handlers/default.handler";
import {endpoint} from "../../interfaces/types/Endpoint";
import Path from "../../schemas/Path";
import * as paths from "../../ext/paths";
import IUser from "../../interfaces/models/IUser";

const deleteOne: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { avid } = req.params;
            await paths.deleteAvailability(avid, req.user as IUser);
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];

export default deleteOne;