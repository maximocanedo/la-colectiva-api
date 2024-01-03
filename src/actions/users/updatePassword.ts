'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        // Buscar el usuario completo por su ID
        const user = await User.findById(userId);

        if (!user) {
            res.status(404);
            return;
        }

        user.password = password;
        const updatedUser = await user.save();

        res.status(200);
    } catch (err) {
        console.error(err);
        res.status(500);
    }
};

export default updatePassword;