'use strict';
import User from "../../schemas/User";
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import {sendCode} from "./startMailVerification";
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
        const _u = await User.findOne({email: email});
        if(_u) {
            res.status(4090).json({ error: E.DuplicationError }).end();
            return;
        }
        const data = { username, name, bio, birth, password };
        // Validar datos.
        let newUser = new User(data);
        // Guardar.
        const savedStatus = await newUser.save();
        const mailSend = await sendCode(savedStatus, email);
        res.status(201).json(mailSend).end();
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
};

export default signup;