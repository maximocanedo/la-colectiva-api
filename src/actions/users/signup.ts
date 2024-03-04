'use strict';
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import * as users from "../../ext/users";
import {ISendCodeResponse} from "./startMailVerification";
const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, ...response }: ISendCodeResponse = await users.create(req.body);
        res.status(201).json(response).end();
    } catch (err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error }).end();
    }
};

export default signup;