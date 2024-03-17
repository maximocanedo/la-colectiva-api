'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import Schedule from "../../schemas/Schedule";
import Path from "../../schemas/Path";
import {NextFunction, Request, Response} from "express";
import E from "../../errors";
import Dock from "../../schemas/Dock";
import V from "../../validators";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import IUser from "../../interfaces/models/IUser";

const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        path: V.schedule.path,
        dock: V.schedule.dock,
        time: V.schedule.time
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { path } = req.body;
        if(!path) next();
        else {
            const reg = await Path.findOne({ _id: path, active: true });
            if(!reg) {
                res.status(400).json({
                    error: E.ResourceNotFound
                }).end();
            } else next();
        }
        return;
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { dock } = req.body;
        if(!dock) next();
        else {
            const reg = await Dock.findOne({ _id: dock, active: true });
            if(!reg) {
                res.status(400).json({
                    error: E.ResourceNotFound
                }).end();
            } else next();
        }
        return;
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            const userId = (<IUser>req.user)._id as string;
            const reg = await Schedule.findOne({ _id: id, active: 1 }, {
                time: 1,
                path: 1,
                _id: 1,
                active: 1,
                dock: 1,
                history: 1,
                user: 1
            });
            if (!reg) {
                res.status(404).json({
                    error: E.ResourceNotFound
                });
                return;
            }
            if (reg.user.toString() != userId.toString()) {
                res.status(403).json({
                    error: E.UnauthorizedRecordModification
                });
                return;
            }
            const { path, dock, time } = req.body;
            if(path) reg.path = path;
            if(dock) reg.dock = dock;
            if(time) reg.time = `1990-01-01T${time}:00.000+00:00`;
            reg.history.push({
                content: "Edición del registro. ",
                time: Date.now(),
                user: (<IUser>req.user)._id as string
            });
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (e) {
            console.error(e);
            const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default edit;