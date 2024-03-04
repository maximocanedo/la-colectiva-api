'use strict';
import Boat, {IBoatView} from "../../schemas/Boat";
import { Request, Response } from "express";
import IBoat from "../../interfaces/models/IBoat";
import IUser from "../../interfaces/models/IUser";
import {endpoint} from "../../interfaces/types/Endpoint";
import E from "../../errors/index";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import defaultHandler from "../../errors/handlers/default.handler";
import Fetch from "../comments/fetch";
import FetchResult from "../../interfaces/responses/FetchResult";
import pre from "../../endpoints/pre";
import * as boats from "../../ext/boats";

const getOne: endpoint[] = [pre.authenticate(true), async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const response: IBoatView = await boats.get(id, req.user);
        res.status(200).json({ data: response }).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
}];
export default getOne;