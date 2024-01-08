"use strict";

import Availability  from "../../schemas/Availability";
import { Request, Response } from "express";
import E from "../../errors";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {MongoError} from "mongodb";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import Mongoose from "mongoose";
import defaultHandler from "../../errors/handlers/default.handler";

const getOne = async (req: Request, res: Response): Promise<void> => {
    try {
        let { id } = req.params;
        let resource = await Availability.findOne(
            {
                _id: id,
                active: true,
            },
            {
                validations: 0,
            }
        )
            .populate("user", "_id name")
            .populate("path", "_id title");
        if (!resource) {
            res.status(404).send({error: E.ResourceNotFound}).end();
            return;
        }
        res.status(200).json(resource);
    } catch (err: Error | any) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};

export default getOne;