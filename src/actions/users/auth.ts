'use strict';
import dotenv from "dotenv";
import {Request, Response} from "express";
import E from "./../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import * as users from "../../ext/users";
import {ILoginResult} from "../../ext/users/defs";
dotenv.config();

const login = async (req: Request, res: Response): Promise<void>  => {
    try {
        const { token }: ILoginResult = await users.login(req.body);
        res.header("Authorization", "Bearer " + token);
        res.status(200).json({ token }).end();
    } catch (e) {
        const { http, ...error }: IError = defaultHandler(e as Error, E.TokenGenerationError);
        res.status(http?? 500).json({ error });
    }
};
const logout = async (_req: Request, res: Response): Promise<void> => {
    res.status(405).end();
};

export {
    login,
    logout
};