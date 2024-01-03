'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import { Request, Response } from "express";
const patchEdit = [pre.auth, pre.allow.admin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params; // Obtiene el ID del registro a actualizar
        const { name, cuit, description, foundationDate } = req.body; // Obtiene los campos a actualizar

        // Verifica si al menos uno de los campos está presente en la solicitud
        if (!name && !cuit && !description && !foundationDate) {
            res.status(400).json({
                error: 'new NoDataGivenOnPatchEdit().toJSON(),'
            });
        }

        const updatedFields: any = {}; // Almacena los campos actualizados dinámicamente

        // Actualiza solo los campos que se proporcionan en la solicitud
        if (name) updatedFields.name = name;
        if (cuit) updatedFields.cuit = cuit;
        if (description) updatedFields.description = description;
        if (foundationDate) updatedFields.foundationDate = foundationDate;

        // Busca y actualiza el registro en la base de datos
        const updatedEnterprise = await Enterprise.findByIdAndUpdate(
            id,
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedEnterprise) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
        }

        res.status(200).json({
            message: "Registro actualizado correctamente.",
            updatedEnterprise,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        });
    }
}];

export default patchEdit;