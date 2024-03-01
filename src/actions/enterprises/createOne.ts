'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {Request, Response, NextFunction} from "express";
import V from "./../../validators";
import E from "../../errors";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";
import * as enterprises from "../../ext/enterprises";
import {IEnterpriseCreateResponse} from "../../ext/enterprises/defs";
import {IError} from "../../interfaces/responses/Error.interfaces";

const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        cuit: V.enterprise.cuit.required(),
        name: V.enterprise.name.required(),
        description: V.enterprise.description,
        foundationDate: V.enterprise.foundationDate,
        phones: V.enterprise.phones
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { _id }: IEnterpriseCreateResponse = await enterprises.create({ ...req.body, responsible: req.user })
            res.status(201).json({
                id: _id
            }).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];
export default createOne;