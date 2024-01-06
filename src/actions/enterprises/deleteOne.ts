'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {NextFunction, Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const deleteOne = [
    pre.auth,
    pre.allow.moderator,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { id } = req.params;
        const resource = await Enterprise.findOne({ _id: id, active: true });
        if(!resource) {
            res.status(404).json({
                error: E.ResourceNotFound
            });
            return;
        } else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const resource = await Enterprise.findById(id);
            const username = req.user._id;
            const isAdmin = req.user.role >= 3;
            if (!resource) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            if (resource.user !== username && !isAdmin) {
                res.status(403).json({
                    error: E.AttemptedUnauthorizedOperation
                }).end();
                return;
            }
            resource.active = false;
            const status = await resource.save();
            res.status(200).json({
                message: "Data was disabled. ",
            }).end();
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];
export default deleteOne;