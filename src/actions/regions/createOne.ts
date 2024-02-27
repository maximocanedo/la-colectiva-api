'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {Request, Response} from "express";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import * as regions from "../../ext/regions";
import {ICreateRegionResponse} from "../../ext/regions/defs";
import {IError} from "../../interfaces/responses/Error.interfaces";

const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.waterBody.name.required(),
        type: V.waterBody.type.required(),
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { _id }: ICreateRegionResponse = await regions.create({ ...req.body, responsible: req.user });
            res.status(200).json({ _id }).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
];

export default createOne;