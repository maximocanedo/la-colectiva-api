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
import IDock, {DockPropertyStatus} from "../../interfaces/models/IDock";
import * as docks from "../../ext/docks";
import {endpoint} from "../../interfaces/types/Endpoint";
import pre, {IPaginator} from "../../endpoints/pre";



const explore: endpoint[] = [pre.paginate, async (req: Request, res: Response): Promise<void> => {
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
        const prefer = parseInt(req.query.prefer as string || "-1");
        const q: string = req.query.q as string || "";
        const response: IDockView[] = await docks.explore({ q, paginator: req.paginator as IPaginator, coordinates: [lat, lng], radio, prefer: <DockPropertyStatus | -1>prefer });
        res.status(200).json({ data: response }).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
}];
export default explore;