'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import {Request, Response} from "express";
import WaterBody from "../../schemas/WaterBody";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";

const getOne: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            let resource = await WaterBody.findOne({ _id: id, active: true });
            if (!resource) {
                res.status(404).json(E.ResourceNotFound);
                return;
            }
            res.status(200).json(resource);
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];

export default getOne;