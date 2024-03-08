 'use strict';

import {Request, Response} from "express";
import * as enterprises from "../../ext/enterprises";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
 import IUser from "../../interfaces/models/IUser";
 import {IEnterpriseView} from "../../schemas/Enterprise";
 import {IError} from "../../interfaces/responses/Error.interfaces";
 import pre from "../../endpoints/pre";
const getOne = [pre.authenticate(true), async (req: Request, res: Response) => {
    try {
        const id: string = req.params.id;
        const response: IEnterpriseView = await enterprises.get({ id, responsible: req.user });
        res.status(200).json({ data: [response] }).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error});
    }
}];
export default getOne;