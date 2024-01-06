'use strict';
import Path from "../../schemas/Path";
import { Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const list = [async (req: Request, res: Response): Promise<void> => {
    try {
        // Cambia findOne por find para obtener todos los registros con active: true
        let resources = await Path.find({ active: true })
            .populate("user", "name _id")
            .populate("boat", "name _id");

        if (!resources || resources.length === 0) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }

        // Mapea los recursos para obtener los datos que necesitas de cada uno
        const formattedResources = resources.map((resource) => {
            const totalValidations = resource.validations.filter(
                (validation) => validation.validation
            ).length;
            const totalInvalidations = resource.validations.filter(
                (validation) => !validation.validation
            ).length;

            const { user, boat, title, description, notes, _id } = resource;

            return {
                _id,
                user,
                boat,
                title,
                description,
                notes,
                validations: totalValidations,
                invalidations: totalInvalidations,
            };
        });

        // Envía la lista de recursos como respuesta
        res.status(200).json(formattedResources);
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
}];
export default list;