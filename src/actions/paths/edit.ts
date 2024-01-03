'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import Boat from "../../schemas/Boat";
import { NextFunction, Request, Response } from "express";
const edit = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput(["boat", "title", "description", "notes"]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { boat } = req.body;
        const obj = await Boat.findById(boat);
        if(!obj) res.status(404).json({
            error: 'new ResourceNotFoundError().toJSON()'
        }); else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg: any = await Path.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: 'new ResourceNotFoundError().toJSON()'
                });
                return;
            }
            if (reg.user.toString() !== userId.toString()) {
                res.status(403).json({
                    error: 'new ExpropriationError().toJSON()'
                });
                return;
            }
            const { boat, cuit, name, description, foundationDate, phones } =
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
            console.error(err);
            res.status(500).json({
                error: 'new CRUDOperationError().toJSON()'
            });
        }
    }];
export default edit;