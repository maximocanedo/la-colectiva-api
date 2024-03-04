'use strict';
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";
import * as enterprises from "../../ext/enterprises";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {endpoint} from "../../interfaces/types/Endpoint";
const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        cuit: V.enterprise.cuit,
        name: V.enterprise.name,
        description: V.enterprise.description,
        foundationDate: V.enterprise.foundationDate
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            await enterprises.edit({ ...req.body, id, responsible: req.user })
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error});
        }
    }
];
export default edit;