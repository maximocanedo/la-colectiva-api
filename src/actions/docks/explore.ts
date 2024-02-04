'use strict';
import Dock, {IDockView} from "../../schemas/Dock";
import { Request, Response } from "express";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose, {FilterQuery} from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";
import IDock from "../../interfaces/models/IDock";
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
        preferObj = {
            ...preferObj,
            active: true
        }
        const query: FilterQuery<IDock> = {
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
        const { status, ...result }: FetchResult<IDockView> = await Dock.listData(query, {
            page,
            itemsPerPage,
        });
        res.status(status).json(result).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error, data: [] });
    }
};
export default explore;