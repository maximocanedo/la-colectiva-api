'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import WaterBody from "../../schemas/WaterBody";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";

const deleteOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            const resource = await WaterBody.findById(id);
            const username = req.user._id;
            const isAdmin: boolean = req.user.role >= 3;
            if (!resource) {
                res.status(404).json({ error: E.ResourceNotFound});
                return;
            }
            if (resource.user != username && !isAdmin) {
                res.status(403).json({ error: E.AttemptedUnauthorizedOperation});
                return;
            }
            resource.active = false;
            const status = await resource.save();
            res.status(200).json({
                message: "Data was disabled. ",
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];

export default deleteOne;