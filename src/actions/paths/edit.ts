'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import Boat from "../../schemas/Boat";
import { NextFunction, Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";
const edit = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        boat: V.path.boat.required(),
        title: V.path.title.required(),
        description: V.path.description.required(),
        notes: V.path.notes.required()
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { boat } = req.body;
        const obj = await Boat.findById(boat);
        if(!obj) res.status(404).json({
            error: E.ResourceNotFound
        }); else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg: any = await Path.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: E.ResourceNotFound
                });
                return;
            }
            if (reg.user.toString() !== userId.toString()) {
                res.status(403).json({
                    error: E.UnauthorizedRecordModification
                });
                return;
            }
            const { boat, name, description, foundationDate, phones } =
                req.body;
            reg.boat = boat;
            reg.name = name;
            reg.description = description;
            reg.foundationDate = foundationDate;
            reg.phones = phones;
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }];
export default edit;