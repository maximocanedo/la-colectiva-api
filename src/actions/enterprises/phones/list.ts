'use strict';
import Enterprise from '../../../schemas/Enterprise';
import {Request, Response} from "express";
import defaultHandler from "../../../errors/handlers/default.handler";
import E from "../../../errors";
import * as enterprises from "../../../ext/enterprises"
import {IError} from "../../../interfaces/responses/Error.interfaces";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const phones: string[] = await enterprises.listPhones(id);
        res.status(200).json({ phones });
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error});
    }
};
export default list;