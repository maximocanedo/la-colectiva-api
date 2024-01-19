'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {Request, Response} from "express";
import WaterBody from "../../schemas/WaterBody";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";

const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.waterBody.name.required(),
        type: V.waterBody.type.required(),
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, type } = req.body;
            const userId = req.user._id;
            let reg = await WaterBody.create({
                user: userId,
                name,
                type,
            });
            res.status(201).json({
                id: reg._id
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];

export default createOne;