'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            res.status(404).json({ error: E.ResourceNotFound}).end();
            return;
        }
        const roles: any = {
            admin: 3,
            moderator: 2,
            normal: 1,
            limited: 0,
        };
        const { role } = req.body;
        if (!role || !(role in roles)) {
            res.status(400).json({
                error: E.InvalidInputFormatError
            }).end();
        }
        user.role = roles[role];
        user.save();
        res.status(200).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};
export default updateRole;