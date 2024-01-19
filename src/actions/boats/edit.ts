'use strict';
import pre from "../../endpoints/pre";
import Boat from "../../schemas/Boat";
import { Request, Response, NextFunction } from "express";
import {Schema} from "mongoose";
import E from "../../errors/index";
import V from "../../validators";
import Enterprise from "../../schemas/Enterprise";
import {IError} from "../../interfaces/responses/Error.interfaces";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";

const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        mat: V.boat.mat,
        name: V.boat.name,
        status: V.boat.status,
        enterprise: V.boat.enterprise,
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { mat, name, status, enterprise } = req.body;
        if(!mat && !name && !('status' in req.body) && !enterprise) {
            res.status(400).json({ error: E.AtLeastOneFieldRequiredError }).end();
        } else next();
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { mat } = req.body;
        const { id } = req.params;
        if(!mat) next();
        else {
            const reg = await Boat.findOne({ mat });
            if(!reg || reg._id === id) next();
            else res.status(409).json({
                    error: E.DuplicationError
                }).end();
        }
        return;
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { enterprise } = req.body;
        if(enterprise) {
            const enterprise_obj = await Enterprise.findOne({ _id: enterprise, active: true });
            if(!enterprise_obj) res.status(404).json({
                error: E.ResourceNotFound
            }).end();
            else next();
        } else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Boat.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            if (
                reg.user.toString() !== userId.toString() ||
                !(req.user.role >= 3)
            ) {
                res.status(403).json({
                    error: E.UnauthorizedRecordModification
                });
                return;
            }
            const { mat, name, status, enterprise } = req.body;
            if(name) reg.name = name;
            if(mat) reg.mat = mat;
            if(enterprise) reg.enterprise = new Schema.Types.ObjectId(enterprise);
            if('status' in req.body) reg.status = status;
            reg.history.push({
                content: "Edición parcial del registro. ",
                time: Date.now(),
                user: req.user._id
            });
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];
export default edit;