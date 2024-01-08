'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response } from "express";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
const explore = async (req: Request, res: Response): Promise<void> => {
    try {
        const lat: number = parseFloat(req.params.lat as string);
        const lng: number = parseFloat(req.params.lng as string);
        const radio: number = parseFloat(req.params.radio as string);
        if(isNaN(lat) || isNaN(lng) || isNaN(radio)) {
            res.status(400).json({
                error: E.InvalidInputFormatError
            }).end();
            return;
        }
        const prefer: number = parseInt(req.query.prefer as string || "-1");
        const q: string = req.query.q as string || "";
        let coordinates: number[] = [lat, lng];
        const page: number = parseInt(req.query.p as string) || 0;
        const itemsPerPage: number = parseInt(req.query.itemsPerPage as string) || 10;
        let preferObj: any = {
            status: prefer,
            name: { $regex: q || "", $options: "i" },
        };
        if (prefer === -1) {
            preferObj = {
                status: { $gt: -1 },
                name: { $regex: q || "", $options: "i" },
            };
        }
        const query = {
            $and: [
                {
                    coordinates: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [...coordinates], // [longitud, latitud]
                            },
                            $maxDistance: radio,
                        },
                    },
                },
                preferObj,
            ],
        };
        let result = await Dock.listData(query, {
            page,
            itemsPerPage,
        });

        res.status(result.status).json(result.items).end();
    } catch (err) {
        console.log(err);
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
export default explore;