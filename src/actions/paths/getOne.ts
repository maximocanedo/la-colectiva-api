'use strict';
import Path, {IPathView} from "../../schemas/Path";
import {Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
import * as paths from "../../ext/paths";
import {IError} from "../../interfaces/responses/Error.interfaces";
import pre from "../../endpoints/pre";
const getOne = [ pre.authenticate(false), async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const response: IPathView = await paths.get({ id, responsible: req.user });
        res.status(200).json({ data: response });
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error});
    }
}];
export default getOne;