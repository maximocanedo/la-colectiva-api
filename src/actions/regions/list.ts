'use strict';

import {Request, Response} from "express";
import WaterBody from "../../schemas/WaterBody";
import E from "../../errors";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";

const list: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            let resources = await WaterBody.find({ active: true }, { validations: 0, comments: 0 });
            res.status(200).json(resources);
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }

    }
];

export default list;