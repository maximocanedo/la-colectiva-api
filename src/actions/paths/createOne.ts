'use strict';
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";

import * as paths from "../../ext/paths";
import {IPathCreateResponse} from "../../ext/paths/defs";
import {IError} from "../../interfaces/responses/Error.interfaces";
import IUser from "../../interfaces/models/IUser";

const createOne = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        boat: V.path.boat.required(),
        title: V.path.title.required(),
        description: V.path.description.required(),
        notes: V.path.notes.required()
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { boat, title, description, notes } = req.body;
            const response: IPathCreateResponse = await paths.create({boat, title, description, notes, responsible: req.user as IUser});
            res.status(201).json(response);
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];
export default createOne;