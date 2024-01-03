'use strict';
import Enterprise from "../../../schemas/Enterprise";
import {Request, Response} from "express";
import {IEnterpriseAddPhoneResponse} from "../../../interfaces/responses/Enterprise.interfaces";
const deleteOne = async (req: Request, res: Response): Promise<void> => {
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
        const result: IEnterpriseAddPhoneResponse = await resource.deletePhone(phone);
        res.status(result.status).json({msg: result.msg});

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
};
export default deleteOne;