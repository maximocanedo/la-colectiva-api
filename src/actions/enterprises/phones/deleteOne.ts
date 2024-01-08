'use strict';
import Enterprise from "../../../schemas/Enterprise";
import {Request, Response} from "express";
import {IEnterpriseAddPhoneResponse} from "../../../interfaces/responses/Enterprise.interfaces";
import E from "../../../errors";
import defaultHandler from "../../../errors/handlers/default.handler";
const deleteOne = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        const { phone } = req.body;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true }, { phones: 1 });

        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }
        const canAddAPhoneNumber: boolean = req.user.role >= 3 || (req.user._id === resource.user);
        if(!canAddAPhoneNumber) {
            res.status(403).json({ error: E.UnauthorizedRecordModification });
            return;
        }
        const result: IEnterpriseAddPhoneResponse = await resource.deletePhone(phone);
        res.status(result.status).json({msg: result.msg});

    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
};
export default deleteOne;