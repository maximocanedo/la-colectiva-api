'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
import {HttpStatusCode, IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as users from "./../../ext/users";
import ColError from "../../ext/error/ColError";
const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { password } = req.body;
        const response: boolean = await users.updatePassword({
            responsible: req.user,
            password
        });
        if(response) {
            res.status(HttpStatusCode.OK);
            return;
        } else throw new ColError(E.InternalError);
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
};

export default updatePassword;