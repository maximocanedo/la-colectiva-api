"use strict";
import Availability from "../../schemas/Availability";
import {NextFunction, Request, Response} from "express";
import {MongoError} from "mongodb";
import pre from "../../endpoints/pre";
import V from "../../validators";
import Path from "../../schemas/Path";
import E from "../../errors";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import {IError} from "../../interfaces/responses/Error.interfaces";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import Mongoose from "mongoose";
import defaultHandler from "../../errors/handlers/default.handler";
import {endpoint} from "../../interfaces/types/Endpoint";
import * as paths from "../../ext/paths";
import IUser from "../../interfaces/models/IUser";
import {IPathAvailabilityCreateResponse} from "../../ext/paths/defs";

const createOne = (isPathInBody: boolean = true): endpoint[] => [
    pre.auth,
    pre.expect(isPathInBody ? {
        path: V.availability.path.required(),
        condition: V.availability.condition.required(),
        available: V.availability.available.required().default(true)
    } : {
        condition: V.availability.condition.required(),
        available: V.availability.available.required().default(true)
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { condition, available } = req.body;
            const path = isPathInBody ? req.body.path : req.params.id;
            const response: IPathAvailabilityCreateResponse = await paths.addAvailability({ id: path, responsible: req.user as IUser, condition, available });
            res.status(201).json(response).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];

export default createOne;