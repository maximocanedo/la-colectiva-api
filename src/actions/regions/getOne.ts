'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import {Request, Response} from "express";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import pre from "../../endpoints/pre";
import * as regions from "../../ext/regions";
import {GetRegionResult} from "../../ext/regions/defs";
import {IError} from "../../interfaces/responses/Error.interfaces";
import IUser from "../../interfaces/models/IUser";

const getOne: endpoint[] = [
    pre.authenticate(true),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            const user: IUser | undefined = req.user;
            const response: GetRegionResult = await regions.get({ id, responsible: user });
            res.status(200).json(response).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ data: [], error }).end();
        }
    }
];
export default getOne;