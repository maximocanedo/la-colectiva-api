'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import {Request, Response} from "express";
import Schedule from "../../schemas/Schedule";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import FetchResult from "../../interfaces/responses/FetchResult";
import IScheduleView from "../../interfaces/views/IScheduleView";
import pre from "../../endpoints/pre";
import IUser from "../../interfaces/models/IUser";

const getOne: endpoint[] = [
    pre.authenticate(true),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            const user: IUser | undefined = req.user;
            const isAdmin: boolean = user !== undefined && user.role === 3;
            let resource: FetchResult<IScheduleView> = await Schedule.findFormatted({ _id: id, ...(isAdmin ? {} : { active: true }) }, {q: "", p: 0, itemsPerPage: 1});
            if (resource.data.length === 0) {
                res.status(404).json({error: E.ResourceNotFound});
                return;
            }
            const file: IScheduleView = resource.data[0];
            console.log(file);
            res.status(200).json(file);
        } catch (e) {
            const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default getOne;