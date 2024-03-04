'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {NextFunction, Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as enterprises from "../../ext/enterprises";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {endpoint} from "../../interfaces/types/Endpoint";
import IUser from "../../interfaces/models/IUser";
const deleteOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            await enterprises.enable({ id, responsible: req.user as IUser });
            res.status(204).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
];
export default deleteOne;