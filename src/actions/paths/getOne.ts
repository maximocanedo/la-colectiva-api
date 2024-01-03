'use strict';
import Path from "../../schemas/Path";
import {Request, Response} from "express";
const getOne = [async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Path.findOne({ _id: id, active: true })
            .populate("user", "name _id")
            .populate("boat", "name _id");

        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
            return;
        }
        const totalValidations = resource.validations.filter(
            (validation) => validation.validation === true
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation) => validation.validation === false
        ).length;

        const { user, boat, title, description, notes } = resource;
        // Envía la imagen como respuesta
        res.status(200).json({
            user,
            boat,
            title,
            description,
            notes,
            validations: totalValidations,
            invalidations: totalInvalidations,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
}];
export default getOne;