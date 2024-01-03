'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response, NextFunction } from "express";
import IValidation from "../../interfaces/models/IValidation";
const getOne = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource: any = await Dock.findOne({ _id: id, active: true })
            .populate("user", "name _id")
            .populate("region", "name type");

        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
        }
        const totalValidations = resource.validations.filter(
            (validation: IValidation) => validation.validation
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation: IValidation) => !validation.validation
        ).length;

        res.status(200).json({
            user: {
                name: resource.user.name,
                _id: resource.user._id,
            },
            name: resource.name,
            address: resource.address,
            region: {
                _id: resource.region._id,
                name: resource.region.name,
                type: resource.region.type,
            },
            notes: resource.notes,
            status: resource.status,
            uploadDate: resource.uploadDate,
            coordinates: resource.coordinates,
            validations: totalValidations,
            invalidations: totalInvalidations,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
};
export default getOne;