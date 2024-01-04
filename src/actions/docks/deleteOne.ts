'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response, NextFunction } from "express";
import E from "./../../errors"
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
const deleteOne = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const resource = await Dock.findById(id);
        const username = req.user.username;
        const isAdmin = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            return;
        }
        if (resource.user !== req.user._id && !isAdmin) {
            res.status(403).json({
                error: E.AttemptedUnauthorizedOperation
            });
            return;
        }
        resource.active = false;
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        });
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
};

export default deleteOne;