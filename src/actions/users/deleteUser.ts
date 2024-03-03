'use strict';
import { Request, Response } from "express";
import {HttpStatusCode, IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import {endpoint} from "../../interfaces/types/Endpoint";
import * as users from "../../ext/users";
import ColError from "../../ext/error/ColError";
import IUser from "../../interfaces/models/IUser";
const deleteUser =
    (me: boolean = false): endpoint[] =>  [
        (async (req: Request, res: Response): Promise<void> => {
            try {
                const { username } = me ? <IUser>req.user : req.params;
                const response: boolean = await users.disable({
                    responsible: req.user as IUser,
                    username
                });
                if(response) res.status(204).end();
                else throw new ColError(E.InternalError);
            } catch (err) {
                const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
                res.status(http?? 500).json({ error });
            }
        })
    ];

export default deleteUser;