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

const deleteOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const resource = await Availability.findOne({ _id: id });
        if (!resource) {
            res.status(404).json({error: E.ResourceNotFound}).end();
            return;
        }
        resource.active = false;
        await resource.save();
        res.status(200).json({
            message: "Deleted",
        }).end();
    } catch (err) {
        if(err instanceof MongoError) {
            const finalError: IError = mongoErrorMiddleware(err as MongoError);
            res.status(502).json({error: finalError}).end();
        } else if(err instanceof mongoose.Error) {
            const finalError: IError = mongooseErrorMiddleware(err as Mongoose.Error);
            res.status(502).json({error: finalError}).end();
        } else {
            res.status(500).json({error: E.InternalError}).end();
        }
    }
};

export default deleteOne;