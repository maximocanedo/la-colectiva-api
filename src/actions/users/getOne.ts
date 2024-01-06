'use strict';
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";

const User = require("../../schemas/User");
const getOne = (me = false) => (async (req: Request, res: Response): Promise<void> => {
    try {
        const username = me ? req.user.username : req.params.username;
        let user = await User.findOne(
            { username, active: true },
            { password: 0 }
        );
        if (!user) {
            res.status(404);
            return;
        }
        res.status(200).json(user);
    } catch (e) {
        const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
});
export default getOne;