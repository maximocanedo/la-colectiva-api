'use strict';
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import User from "./../../schemas/User";
import E from "../../errors";

const getOne = (me = false) => (async (req: Request, res: Response): Promise<void> => {
    try {
        const username = me ? req.user.username : req.params.username;
        let user = await User.findOne(
            { username, active: true },
            { password: 0 }
        );
        if (!user) {
            res.status(404).json({ error: E.ResourceNotFound }).end();
            return;
        }
        res.status(200).json(user);
    } catch (e) {
        const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
});
export default getOne;