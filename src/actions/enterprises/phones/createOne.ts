'use strict';
import Enterprise from '../../../schemas/Enterprise';
import {Request, Response} from "express";
const createOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const { phone } = req.body;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
            return;
        }
        const result = await resource.addPhone(phone);
        res.status(result.status).json({msg: result.msg});

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
};
export default createOne;