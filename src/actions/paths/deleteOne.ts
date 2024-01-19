'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import { NextFunction, Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const deleteOne = [pre.auth, pre.allow.moderator, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const resource = await Path.findById(id);
        const username = req.user._id;
        const isAdmin: boolean = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        }
        if (resource.user.toString() !== username.toString() && !isAdmin) {
            res.status(403).json({
                error: E.AttemptedUnauthorizedOperation
            });
            return;
        }
        resource.active = false;
        resource.history.push({
            content: "Deshabilitación del recurso. ",
            time: Date.now(),
            user: req.user._id
        });
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        });
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
}];
export default deleteOne;