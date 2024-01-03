'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
const editPersonalInfo = (me = false) => (async (req: Request, res: Response): Promise<void> => {
    try {
        const { username } = me ? req.user : req.params;
        const { name, bio, email, birth } = req.body;

        const user = await User.findOne({ username, active: true });
        if (!user) {
            res.status(404).end();
            return;
        }

        if(name) user.name = name;
        if(bio) user.bio = bio;
        if(email) user.email = email;
        if(birth) user.birth = birth;
        if(!name && !bio && !email && !birth) res.status(400).end();

        const updatedUser = await user.save();
        res.status(200).end();

    } catch (err) {
        console.error(err);
        res.status(500).end();
    }
});

export default editPersonalInfo;