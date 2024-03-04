'use strict';

import { endpoint } from "../../interfaces/types/Endpoint";
import { Request, Response, NextFunction } from "express";
import Path from "./../../schemas/Path";
import E from "./../../errors";
import Availability from "../../schemas/Availability";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";

// TODO
const getByPath: endpoint[] = [
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const file = await Path.findOne({ active: true, _id: id });
        if(!file) {
            res.status(404).json({ error: E.ResourceNotFound }).end();
            return;
        } else {
            next();
        }
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const path: string = req.params.id;
            const files = await Availability.find({path, active: true,}, {validations: 0});
            res.status(200).json({
                data: files,
                error: null
            }).end();
        } catch(e) {
            const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
            res.status(500).json({ data: [], error });
        }
    }
];

export default getByPath;