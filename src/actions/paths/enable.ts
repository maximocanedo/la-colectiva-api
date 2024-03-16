'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import { NextFunction, Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as paths from "../../ext/paths";
import {IError} from "../../interfaces/responses/Error.interfaces";
import IUser from "../../interfaces/models/IUser";
import {endpoint} from "../../interfaces/types/Endpoint";
const deleteOne: endpoint[] = [pre.auth, pre.allow.admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        await paths.enable({ id, responsible: req.user as IUser });
        res.status(204).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error});
    }
}];
export default deleteOne;