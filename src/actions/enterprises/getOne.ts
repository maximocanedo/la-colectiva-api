'use strict';

import {Request, Response} from "express";
import Enterprise from "../../schemas/Enterprise";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const getOne = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Enterprise.findOne({ _id: id, active: true });
        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }
        const totalValidations = resource.validations.filter(
            (validation) => validation.validation
        ).length;
        const totalInvalidations = resource.validations.filter(
            (validation) => !validation.validation
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
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
};
export default getOne;