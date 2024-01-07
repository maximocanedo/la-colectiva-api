'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {NextFunction, Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";
const patchEdit = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        cuit: V.enterprise.cuit,
        name: V.enterprise.name,
        description: V.enterprise.description,
        foundationDate: V.enterprise.foundationDate,
        phones: V.enterprise.phones
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { cuit } = req.body;
        const { id } = req.params;
        if(!cuit) next();
        else {
            const reg = await Enterprise.findOne({ cuit });
            if(!reg) next();
            else {
                if(reg._id === id) next();
                else res.status(409).json({ error: E.DuplicationError }).end();
            }
        }
        return;
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params; // Obtiene el ID del registro a actualizar
            const { name, cuit, description, foundationDate } = req.body; // Obtiene los campos a actualizar

            // Verifica si al menos uno de los campos está presente en la solicitud
            if (!name && !cuit && !description && !foundationDate) {
                res.status(400).json({
                    error: E.AtLeastOneFieldRequiredError
                });
            }
            const en = await Enterprise.findOne({ _id: id, active: true });
            if(!en) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            const username = req.user._id;
            const isAdmin = req.user.role >= 3;
            if (en.user !== username && !isAdmin) {
                res.status(403).json({
                    error: E.AttemptedUnauthorizedOperation
                }).end();
                return;
            }

            // Actualiza solo los campos que se proporcionan en la solicitud
            if (name) en.name = name;
            if (cuit) en.cuit = cuit;
            if (description) en.description = description;
            if (foundationDate) en.foundationDate = foundationDate;

            // Busca y actualiza el registro en la base de datos
            const updatedEnterprise = await en.save();

            res.status(200).json({
                message: "Registro actualizado correctamente.",
                updatedEnterprise,
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];

export default patchEdit;