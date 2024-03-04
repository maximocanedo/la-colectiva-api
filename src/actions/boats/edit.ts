'use strict';
import pre from "../../endpoints/pre";
import Boat from "../../schemas/Boat";
import { Request, Response, NextFunction } from "express";
import {Schema} from "mongoose";
import E from "../../errors/index";
import V from "../../validators";
import Enterprise from "../../schemas/Enterprise";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";
import * as boats from "../../ext/boats";
import IUser from "../../interfaces/models/IUser";

const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        mat: V.boat.mat,
        name: V.boat.name,
        status: V.boat.status,
        enterprise: V.boat.enterprise,
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            await boats.edit({ ...req.body, id, responsible: req.user as IUser });
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
];
export default edit;