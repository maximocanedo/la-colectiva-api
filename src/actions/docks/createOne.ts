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
import defaultHandler from "../../errors/handlers/default.handler";

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
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { region } = req.body;
        const obj = await WaterBody.findOne({ _id: region, active: true });
        if (!obj) {
            res.status(400).json({
                error: E.ResourceNotFound
            });
        } else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                name,
                address,
                region,
                notes,
                status,
                coordinates
            } = req.body;
            const user = req.user._id;
            let reg = await Dock.create({
                user,
                name,
                address,
                region,
                notes,
                status,
                coordinates // [ latitude, longitude ]
            });
            res.status(201).json({
                id: reg._id
            });
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }

];
export default createOne;