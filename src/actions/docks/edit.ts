'use strict';
import pre from "../../endpoints/pre";
import Dock from "../../schemas/Dock";
import { ObjectId } from "mongodb";
import {NextFunction, Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../../errors";
import V from "../../validators";
import WaterBody from "../../schemas/WaterBody";
import defaultHandler from "../../errors/handlers/default.handler";
import {endpoint} from "../../interfaces/types/Endpoint";
import * as docks from "../../ext/docks";
import IUser from "../../interfaces/models/IUser";
const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.dock.name,
        address: V.dock.address,
        region: V.dock.region,
        notes: V.dock.notes,
        status: V.dock.status,
        coordinates: V.dock.coordinates
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            await docks.edit({ ...req.body, id, responsible: req.user as IUser });
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
];

export default edit;