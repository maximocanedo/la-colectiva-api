'use strict';
// /paths/xxx/schedules
// /paths/xxx/schedules?condition=MONDAY

import {endpoint} from "../../../interfaces/types/Endpoint";
import {Request, Response, NextFunction} from "express";
import Path from "../../../schemas/Path";
import E from "../../../errors";
import Schedule from "../../../schemas/Schedule";
import defaultHandler from "../../../errors/handlers/default.handler";
import {ObjectId} from "mongodb";
import FetchResult from "../../../interfaces/responses/FetchResult";
import IScheduleView from "../../../interfaces/views/IScheduleView";
// TODO Optimize it
const getAllSchedules: endpoint[] = [
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const resource = await Path.findOne(
            { active: true, _id: new ObjectId(id) }
        );
        if(!resource) {
            res.status(404).json({
                error: E.ResourceNotFound,
                data: []
            }).end();
        } else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {id} = req.params;

            const q: string = req.query.q as string || "";
            const page: number = parseInt(req.query.p as string) || 0;
            const itemsPerPage: number = parseInt(req.query.itemsPerPage as string) || 10;

            const action: FetchResult<IScheduleView> = await Schedule.findFormatted({
                path: id,
                active: true,
            }, { q, p: page, itemsPerPage });
            const { status, ...response } = action;
            res.status(status).json(response).end();
        } catch(err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error, data: []});
        }
    }
];

export default getAllSchedules;