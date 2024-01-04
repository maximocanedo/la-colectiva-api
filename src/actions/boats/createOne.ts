'use strict';

import Boat from "../../schemas/Boat";
import {NextFunction, Request, Response} from "express";
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import E from "../../errors/index";
import V from "../../validators";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {MongoError} from "mongodb";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import mongoose from "mongoose";
import {endpoint} from "../../interfaces/types/Endpoint";



const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        mat: V.boat.mat.required(),
        name: V.boat.name.required(),
        status: V.boat.status.required().default(true),
        enterprise: V.boat.enterprise.required(),
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { enterprise } = req.body;
        const enterprise_obj = await Enterprise.findOne({ _id: enterprise, active: true });
        if(!enterprise_obj) res.status(404).json({
            error: E.ResourceNotFound
        }).end();
        else next();
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { mat } = req.body;
        const boat = await Boat.findOne({ mat, active: true });
        if(boat) res.status(409).json({
            error: E.DuplicationError
        }).end();
        else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { mat, name, status, enterprise } = req.body;
            const user = req.user._id;
            await Boat.create({
                mat,
                name,
                status,
                enterprise,
                user,
            });
            res.status(201).end();
        } catch (err) {
            if(err instanceof MongoError) {
                const error: IError = mongoErrorMiddleware(err as MongoError);
                res.status(500).json({error}).end();
            } else if(err instanceof mongoose.Error) {
                const error: IError = mongooseErrorMiddleware(err as mongoose.Error);
                res.status(500).json({error}).end();
            } else res.status(500).json({
                error: E.CRUDOperationError
            }).end();
        }
    }
];

export default createOne;