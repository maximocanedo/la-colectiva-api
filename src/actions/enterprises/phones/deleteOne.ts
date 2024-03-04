'use strict';
import Enterprise from "../../../schemas/Enterprise";
import {Request, Response} from "express";
import {IEnterpriseAddPhoneResponse} from "../../../interfaces/responses/Enterprise.interfaces";
import E from "../../../errors";
import defaultHandler from "../../../errors/handlers/default.handler";
import IUser from "../../../interfaces/models/IUser";
import * as enterprises from "../../../ext/enterprises"
import {IError} from "../../../interfaces/responses/Error.interfaces";
const deleteOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const { phone } = req.body;
        const phones: string[] = await enterprises.deletePhone({ id, responsible: req.user as IUser, phone });
        res.status(200).json({ phones });

    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error});
    }
};
export default deleteOne;