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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const pathId = isPathInBody ? req.body.path : req.params.id;
        const resource = Path.findOne({ _id: pathId, active: true });
        if (!resource)
            res.status(404).json({error: E.ResourceNotFound}).end();
        else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { condition, available } = req.body;
            const path = isPathInBody ? req.body.path : req.params.id;
            const user = req.user._id;
            const reg = await Availability.create({
                path,
                condition,
                available,
                user,
                history: [
                    {
                        content: "Creación del registro. ",
                        time: Date.now(),
                        user: req.user._id
                    }
                ]
            });
            res.status(201).json({
                id: reg._id
            }).end();
        } catch (err: Error | any) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default createOne;