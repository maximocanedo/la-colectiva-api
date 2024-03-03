'use strict';

import {Request, Response} from "express";
import pre from "../../endpoints/pre";
import E from "../../errors/index";
import V from "../../validators";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";
import * as boats from "../../ext/boats";
import {IBoatCreateResponse} from "../../ext/boats/defs";


const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        mat: V.boat.mat.required(),
        name: V.boat.name.required(),
        status: V.boat.status.required().default(true),
        enterprise: V.boat.enterprise.required(),
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const response: IBoatCreateResponse = await boats.create({ ...req.body, responsible: req.user });
            res.status(201).json(response).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
];

export default createOne;