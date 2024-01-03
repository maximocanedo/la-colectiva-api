'use strict';
import User from "../../schemas/User";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {Request, Response} from "express";
dotenv.config();

const login = async (req: Request, res: Response): Promise<void>  => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, active: true });
        if (!user) {
            res.status(401).json({
                error: 'new InvalidCredentials().toJSON()'
            }).end();
            return;
        }
        const passwordMatch = await user.comparePassword(password);
        if (passwordMatch) {
            const token = jwt.sign({ user: user._id }, process.env.JWT_SECRET_KEY as string, {
                expiresIn: req.body.maxAge?? '24h',
            });
            res.header("Authorization", "Bearer " + token);
            res.status(200).json({token}).end();
        } else {
            res.status(401).json({
                error: 'new InvalidCredentials().toJSON()'
            }).end();
        }
    } catch (error) {
        // TODO: Log error in separate file
        res.status(500).json({
            error: 'new TokenGenerationError().toJSON()'
        }).end();
    }
};
const logout = async (req: Request, res: Response): Promise<void> => {
    res.status(405).end();
};

export {
    login,
    logout
};