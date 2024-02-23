'use strict';
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as users from "./../../ext/users";
import ColError from "../../ext/error/ColError";
const editPersonalInfo = (me: boolean = false) => (async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = me ? req.user : req.params;
        const response: boolean = await users.edit({
            ...(req.body),
            responsible: req.user,
            username,
        });
        if(response) res.status(200).end();
        else throw new ColError(E.InternalError);
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
});

export default editPersonalInfo;