'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        let { username, name, email, bio, birth, password } = req.body;
        const usernameIsAvailable: boolean = await User.isUsernameAvailable(
            username
        );
        if (!usernameIsAvailable) {
            res.status(409).json({ error: E.DuplicationError }).end();
            return;
        }
        let m = null;
        if(email) m = email;
        const data = { username, name, bio, email: m, birth, password };
        // Validar datos.
        let newUser = new User(data);
        // Guardar.
        const savedStatus = await newUser.save();
        res.status(201).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};

export default signup;