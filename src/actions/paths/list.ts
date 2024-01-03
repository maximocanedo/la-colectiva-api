'use strict';
import Path from "../../schemas/Path";
import { Request, Response } from "express";
const list = [async (req: Request, res: Response): Promise<void> => {
    try {
        // Cambia findOne por find para obtener todos los registros con active: true
        let resources = await Path.find({ active: true })
            .populate("user", "name _id")
            .populate("boat", "name _id");

        if (!resources || resources.length === 0) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
            return;
        }

        // Mapea los recursos para obtener los datos que necesitas de cada uno
        const formattedResources = resources.map((resource) => {
            const totalValidations = resource.validations.filter(
                (validation) => validation.validation === true
            ).length;
            const totalInvalidations = resource.validations.filter(
                (validation) => validation.validation === false
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
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
}];
export default list;