'use strict';

import pre from "../../endpoints/pre";
import Boat from "../../schemas/Boat";
import { Request, Response } from "express";

const deleteOne = [pre.auth, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const resource = await Boat.findById(id);
        const isAdmin: boolean = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
            return;
        }
        if (resource.user !== req.user._id && !isAdmin) {
            res.status(403).json({
                error: 'new ExpropiationError().toJSON()'
            }).end();
            return;
        }
        resource.active = false;
        await resource.save();
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON()'
        }).end();
    }
}]; // Eliminar registro

export default deleteOne;