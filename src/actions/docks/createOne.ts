'use strict';

import pre from './../../endpoints/pre';
import WaterBody from "../../schemas/WaterBody";
import Dock from "../../schemas/Dock";
import {NextFunction, Request, Response} from "express";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import V from "../../validators";
import {endpoint} from "../../interfaces/types/Endpoint";
import * as docks from "../../ext/docks";
import defaultHandler from "../../errors/handlers/default.handler";
import IUser from "../../interfaces/models/IUser";
import {IDockCreateResponse} from "../../ext/docks/defs";

const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.dock.name.required(),
        address: V.dock.address.required(),
        region: V.dock.region.required(),
        notes: V.dock.notes.required(),
        status: V.dock.status.required(),
        coordinates: V.dock.coordinates.required()
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const response: IDockCreateResponse = await docks.create({ ...req.body, responsible: req.user as IUser });
            res.status(201).json(response);
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }

];
export default createOne;