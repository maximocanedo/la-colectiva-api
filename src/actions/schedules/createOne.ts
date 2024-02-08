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



const createOne = (isPathInBody: boolean = true): endpoint[] => [
    pre.auth,
    pre.allow.moderator,
    pre.expect(
        isPathInBody ? {
            path: V.schedule.path.required(),
            dock: V.schedule.dock.required(),
            time: V.schedule.time.required()
        } : {
            dock: V.schedule.dock.required(),
            time: V.schedule.time.required()
        }
    ),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const path = isPathInBody ? req.body.path : req.params.id;
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
            const { dock, time } = req.body;
            const path = isPathInBody ? req.body.path : req.params.id;
            const userId = req.user._id;
            const formattedTime: string = `1990-01-01T${time}:00.000+00:00`;
            let reg = await Schedule.create({
                user: userId,
                path,
                dock,
                time: new Date(formattedTime),
                history: [
                    {
                        content: "Creación del registro. ",
                        time: Date.now(),
                        user: req.user._id
                    }
                ]
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