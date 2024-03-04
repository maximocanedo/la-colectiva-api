'use strict';

import pre from "../../endpoints/pre";
import Boat from "../../schemas/Boat";
import { Request, Response } from "express";
import E from "../../errors/index";
import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {mongoErrorMiddleware} from "../../errors/handlers/MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "../../errors/handlers/MongooseError.handler";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";
import * as boats from "../../ext/boats";
import IUser from "../../interfaces/models/IUser";

const deleteOne: endpoint[] = [pre.auth, pre.allow.moderator, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        await boats.disable({ id, responsible: req.user as IUser });
        res.status(204).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
}];

export default deleteOne;