'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user._id;
        const { password } = req.body;

        // Buscar el usuario completo por su ID
        const user = await User.findOne({ _id: userId, active: true });

        if (!user) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }

        user.password = password;
        const updatedUser = await user.save();
        res.status(200).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};

export default updatePassword;