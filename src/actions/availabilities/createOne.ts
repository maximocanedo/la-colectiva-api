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

const createOne = [
    pre.expect({
        path: V.availability.path.required(),
        condition: V.availability.condition.required(),
        available: V.availability.available.required().default(true)
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resource = Path.findOne({ _id: req.path, active: true });
        if (!resource)
            res.status(404).json({error: E.ResourceNotFound}).end();
        else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { path, condition, available } = req.body;
            const user = req.user._id;
            await Availability.create({
                path,
                condition,
                available,
                user,
            });
            res.status(201).end();
        } catch (err: Error | any) {
            if (err instanceof MongoError) {
                const finalError: IError = mongoErrorMiddleware(err as MongoError);
                res.status(500).json({error: finalError});
            } else if(err instanceof mongoose.Error) {
                const finalError: IError = mongooseErrorMiddleware(err as Mongoose.Error);
                res.status(502).json({error: finalError}).end();
            } else {
                res.status(500).json({error: E.InternalError});
            }
            res.end();
        }
    }
];

export default createOne;