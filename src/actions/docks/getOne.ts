'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response } from "express";
import IValidation from "../../interfaces/models/IValidation";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
const getOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource: any = await Dock.findOne({ _id: id, active: true }, { comments: 0, validations: 0 })
            .populate("user", "name _id")
            .populate("region", "name type");

        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            return;
        }

        res.status(200).json(resource).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};
export default getOne;