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
const getOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource: any = await Dock.findOne({ _id: id, active: true })
            .populate("user", "name _id")
            .populate("region", "name type");

        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            return;
        }
        const totalValidations = resource.validations.filter(
            (validation: IValidation) => validation.validation
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation: IValidation) => !validation.validation
        ).length;

        res.status(200).json({
            user: {
                name: resource.user.name,
                _id: resource.user._id,
            },
            name: resource.name,
            address: resource.address,
            region: {
                _id: resource.region._id,
                name: resource.region.name,
                type: resource.region.type,
            },
            notes: resource.notes,
            status: resource.status,
            uploadDate: resource.uploadDate,
            coordinates: resource.coordinates,
            validations: totalValidations,
            invalidations: totalInvalidations,
        }).end();
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
export default getOne;