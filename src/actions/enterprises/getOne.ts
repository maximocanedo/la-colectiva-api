'use strict';

import {Request, Response} from "express";
import Enterprise from "../../schemas/Enterprise";
const getOne = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true });

        if (!resource) {
            return res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
        }
        const totalValidations = resource.validations.filter(
            (validation) => validation.validation === true
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation) => validation.validation === false
        ).length;

        const {
            _id,
            cuit,
            name,
            user,
            description,
            foundationDate,
            phones,
            active,
        } = resource;
        // Envía la imagen como respuesta
        res.status(200).json({
            _id,
            user,
            cuit,
            name,
            description,
            foundationDate,
            phones,
            active,
            validations: totalValidations,
            invalidations: totalInvalidations,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new ExpropriationError().toJSON()'
        });
    }
};
export default getOne;