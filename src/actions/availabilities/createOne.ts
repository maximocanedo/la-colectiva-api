"use strict";
import Availability from "../../schemas/Availability";
import { Request, Response } from "express";
import {MongoError} from "mongodb";

const createOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const { path, condition, available } = req.body;
        const user = req.user._id;
        // Utilizar el método add para crear el comentario
        const newResource = await Availability.create({
            path,
            condition,
            available,
            user,
        });
        res.status(201).end();
    } catch (err: Error | any) {
        if (err instanceof MongoError) {
            // MongoError. TODO Crear función que maneje todos los MongoError.
        } else {
            res.status(500).json({ error: "Internal error. "});
        }
        res.end();
    }
};

export default createOne;