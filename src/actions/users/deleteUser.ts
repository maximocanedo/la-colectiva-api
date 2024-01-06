'use strict';
import User from "../../schemas/User";
import { Request, Response, NextFunction } from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import pre from "../../endpoints/pre";
const deleteUser =
    (me: boolean = false) =>  [
        (async (req: Request, res: Response): Promise<void> => {
            try {
                const { username } = me ? req.user : req.params;
                let user = await User.findOne({ username, active: true }, { password: 0 });
                if (!user) {
                    res.status(404).json({ error: E.ResourceNotFound }).end();
                    return;
                }
                user.active = false;
                await user.save();
                res.status(200).end();
            } catch (err) {
                const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
                res.status(500).json({ error });
            }
        })
    ];

export default deleteUser;