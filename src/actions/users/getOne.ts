'use strict';
import {Request, Response} from "express";

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
        console.error({ e });
        res.status(500);
    }
});
export default getOne;