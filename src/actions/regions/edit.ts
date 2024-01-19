'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {Request, Response} from "express";
import E from "../../errors";
import WaterBody from "../../schemas/WaterBody";
import defaultHandler from "../../errors/handlers/default.handler";

const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.waterBody.name,
        type: V.waterBody.type,
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { name, type } = req.body;
            if(!name && !type) {
                res.status(400).json({
                    error: E.AtLeastOneFieldRequiredError
                }).end();
                return;
            }
            const id: string = req.params.id;
            const userId = req.user._id;
            const reg = await WaterBody.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({ error: E.ResourceNotFound});
                return;
            }
            if (reg.user.toString() != userId.toString()) {
                res.status(403).json({ error: E.UnauthorizedRecordModification});
                return;
            }
            if(name) reg.name = name;
            if(type) reg.type = type;
            reg.history.push({
                content: "Edición parcial del registro. ",
                time: Date.now(),
                user: req.user._id
            });
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];

export default edit;