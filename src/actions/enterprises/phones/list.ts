'use strict';
import Enterprise from '../../../schemas/Enterprise';
import {Request, Response} from "express";
import defaultHandler from "../../../errors/handlers/default.handler";
import E from "../../../errors";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }

        const phones: string[] = resource.phones;
        res.status(200).json({ phones });

    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
};
export default list;