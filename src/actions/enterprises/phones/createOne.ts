'use strict';
import {Request, Response} from "express";
import defaultHandler from "../../../errors/handlers/default.handler";
import E from "../../../errors";
import * as enterprises from "./../../../ext/enterprises";
import IUser from "../../../interfaces/models/IUser";
import {IError} from "../../../interfaces/responses/Error.interfaces";
const createOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const { phone } = req.body;
        const phones: string[] = await enterprises.addPhone({ id, responsible: req.user as IUser, phone });
        res.status(201).json({ phones });

    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error});
    }
};
export default createOne;