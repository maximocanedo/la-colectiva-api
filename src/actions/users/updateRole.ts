'use strict';
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as users from "./../../ext/users";
import ColError from "../../ext/error/ColError";
import IUser from "../../interfaces/models/IUser";
import {Role} from "../../ext/users/defs";
const updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const responsible: IUser = req.user;
        const username: string = req.params.username;
        const role: Role = req.body.role;
        const response: boolean = await users.updateRole({ responsible, username, role });
        if(response) res.status(200).end();
        else throw new ColError(E.InternalError);
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error });
    }
};
export default updateRole;