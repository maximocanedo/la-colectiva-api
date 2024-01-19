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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const resource = await Availability.findOne({ _id: id });
        if (!resource) {
            res.status(404).json({error: E.ResourceNotFound}).end();
            return;
        }
        resource.active = false;
        resource.history.push({
            content: "Deshabilitación del registro. ",
            time: Date.now(),
            user: req.user._id
        });
        await resource.save();
        res.status(200).json({
            message: "Deleted",
        }).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};

export default deleteOne;