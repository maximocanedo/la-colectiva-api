'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import { NextFunction, Request, Response } from "express";
const deleteOne = [pre.auth, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const resource = await Path.findById(id);
        const username = req.user._id;
        const isAdmin = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON(),'
            });
            return;
        }
        if (resource.user !== username && !isAdmin) {
            res.status(403).json({
                error: 'new ExpropriationError().toJSON()'
            });
            return;
        }
        resource.active = false;
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON(),'
        });
    }
}];
export default deleteOne;