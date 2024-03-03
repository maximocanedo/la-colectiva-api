'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import Boat from "../../schemas/Boat";
import { NextFunction, Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";
import {IHistoryEvent} from "../../schemas/HistoryEvent";
import {endpoint} from "../../interfaces/types/Endpoint";
import * as paths from "../../ext/paths";
import {IError} from "../../interfaces/responses/Error.interfaces";
import IUser from "../../interfaces/models/IUser";


const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        boat: V.path.boat,
        title: V.path.title,
        description: V.path.description,
        notes: V.path.notes
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            await paths.edit({ ...req.body, id, responsible: req.user as IUser });
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];
export default edit;