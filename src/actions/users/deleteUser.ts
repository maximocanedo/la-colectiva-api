'use strict';
import User from "../../schemas/User";
import { Request, Response, NextFunction } from "express";
const deleteUser = (me = false) => (async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = me ? req.user : req.params;
        let user = await User.findOne({ username, active: true }, { password: 0 });
        if (!user) {
            res.status(404).end();
            return;
        }
        user.active = false;
        let savedStatus = await user.save();
        res.status(200).end();
    } catch (err) {
        console.log(err);
        res.status(500).end();
    }
});

export default deleteUser;