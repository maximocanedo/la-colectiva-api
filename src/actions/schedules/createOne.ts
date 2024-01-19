'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {NextFunction, Request, Response} from "express";
import Path from "../../schemas/Path";
import E from "../../errors";
import Dock from "../../schemas/Dock";
import Schedule from "../../schemas/Schedule";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";

const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        path: V.schedule.path.required(),
        dock: V.schedule.dock.required(),
        time: V.schedule.time.required()
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { path } = req.body;
        const reg = await Path.findOne({ _id: path, active: true });
        if(!reg) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            return;
        } else next();
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { dock } = req.body;
        const reg = await Dock.findOne({ _id: dock, active: true });
        if(!reg) {
            res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            return;
        } else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { path, dock, time } = req.body;
            const userId = req.user._id;
            let reg = await Schedule.create({
                user: userId,
                path,
                dock,
                time,
            });
            res.status(201).json({
                id: reg._id
            });
        } catch (e) {
            const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default createOne;