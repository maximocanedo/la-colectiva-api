'use strict';
import User from "../../schemas/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {Request, Response} from "express";
import E from "./../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
dotenv.config();

const login = async (req: Request, res: Response): Promise<void>  => {
    const { username, password, email } = req.body;
    let query: any = {
        active: true
    };

    if (username) {
        query.$or = [{ username }];
    }
    if (email) {
        if (query.$or) query.$or.push({ email });
        else query.$or = [{ email }];
    }

    try {
        const user = await User.findOne(query);
        if (!user) {
            res.status(401).json({
                error: E.InvalidCredentials
            }).end();
            return;
        }
        const passwordMatch = await user.comparePassword(password);
        if (passwordMatch) {
            const token: string = jwt.sign({
                user: user._id
            }, process.env.JWT_SECRET_KEY as string, {
                expiresIn: req.body.maxAge?? '24h',
            });
            res.header("Authorization", "Bearer " + token);
            res.status(200).json({token}).end();
        } else {
            res.status(401).json({
                error: E.InvalidCredentials
            }).end();
        }
    } catch (e) {
        const error: IError | null = defaultHandler(e as Error, E.TokenGenerationError);
        res.status(500).json({ error });
    }
};
const logout = async (req: Request, res: Response): Promise<void> => {
    res.status(405).end();
};

export {
    login,
    logout
};