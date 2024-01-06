'use strict';

import pre from "../../endpoints/pre";
import Boat from "../../schemas/Boat";
import { Request, Response } from "express";
import E from "../../errors/index";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import {endpoint} from "../../interfaces/types/Endpoint";

const deleteOne: endpoint[] = [pre.auth, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const resource = await Boat.findById(id);
        const isAdmin: boolean = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }
        if (resource.user !== req.user._id && !isAdmin) {
            res.status(403).json({
                error: E.AttemptedUnauthorizedOperation
            }).end();
            return;
        }
        resource.active = false;
        await resource.save();
        res.status(204).end();
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
}]; // Eliminar registro

export default deleteOne;