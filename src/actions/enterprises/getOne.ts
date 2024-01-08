'use strict';

import {Request, Response} from "express";
import Enterprise from "../../schemas/Enterprise";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const getOne = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true }, { validations: 0, comments: 0 });
        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }
        res.status(200).json(resource);
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
};
export default getOne;