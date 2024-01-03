'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
const updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            res.status(404).end();
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
            res.status(400).send("Invalid role. ").end();
        }
        user.role = roles[role];
        user.save();
        res.status(200).end();
    } catch (err) {
        res.status(500).end();
    }
};
export default updateRole;