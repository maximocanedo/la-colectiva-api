'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {Request, Response} from "express";
import E from "../../errors";
import WaterBody from "../../schemas/WaterBody";
import defaultHandler from "../../errors/handlers/default.handler";
import * as regions from "../../ext/regions";
import IUser from "../../interfaces/models/IUser";
import {IError} from "../../interfaces/responses/Error.interfaces";

const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.waterBody.name,
        type: V.waterBody.type,
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, type } = req.body;
            const responsible: IUser = req.user as IUser;
            const id: string = req.params.id;
            await regions.edit({ responsible, id }, { name, type });
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error }).end();
        }
    }
];

export default edit;