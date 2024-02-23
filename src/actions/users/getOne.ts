'use strict';
import {Request, Response} from "express";
import {HttpStatusCode, IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as users from "../../ext/users";
import IUser from "../../interfaces/models/IUser";

const getOne = (me: boolean = false) => (async (req: Request, res: Response): Promise<void> => {
    try {
        const response: IUser = await users.find({
            responsible: req.user,
            username: me ? "me" : req.params.username
        });
        res.status(HttpStatusCode.OK).json(response);
    } catch (e) {
        const { http, ...error }: IError = defaultHandler(e as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
});
export default getOne;