'use strict';


import pre from "../../endpoints/pre";
import Boat from "../../schemas/Boat";
import {ObjectId} from "mongodb";
import { Request, Response } from "express";
import {Schema} from "mongoose";


const edit = [
    pre.auth,
    pre.allow.moderator,
    // TODO: Not all properties are required.
    pre.verifyInput(["mat", "name", "status", "enterprise"]),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Boat.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: 'new ResourceNotFoundError().toJSON(),'
                }).end();
                return;
            }
            if (
                reg.user.toString() !== userId.toString() ||
                !(req.user.role >= 3)
            ) {
                res.status(403).json({
                    error: 'new ExpropriationError().toJSON(),'
                });
                return;
            }
            const { mat, name, status, enterprise } = req.body;
            reg.name = name;
            reg.mat = mat;
            reg.enterprise = new Schema.Types.ObjectId(enterprise);
            reg.status = status;
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: 'new CRUDOperationError().toJSON(),'
            });
        }
    }
];
export default edit;