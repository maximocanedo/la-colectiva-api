'use strict';
import Path from "../../schemas/Path";
import {Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const getOne = [async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Path.findOne({ _id: id, active: true })
            .populate("user", "name _id")
            .populate("boat", "name _id");

        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }

        const { user, boat, title, description, notes } = resource;
        // Envía la imagen como respuesta
        res.status(200).json({
            user,
            boat,
            title,
            description,
            notes
        });
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
}];
export default getOne;