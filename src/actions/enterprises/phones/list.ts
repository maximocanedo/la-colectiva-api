'use strict';
import Enterprise from '../../../schemas/Enterprise';
import {Request, Response} from "express";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        const resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
            return;
        }

        const phones = resource.phones;
        res.status(200).json({ phones });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
};
export default list;