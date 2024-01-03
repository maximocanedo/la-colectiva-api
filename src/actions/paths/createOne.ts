'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import Boat from "../../schemas/Boat";
import {NextFunction, Request, Response} from "express";

const createOne = [
    pre.auth,
    pre.allow.admin,
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
            const { boat, title, description, notes } = req.body;
            const userId = req.user._id;
            let reg = await Path.create({
                boat,
                user: userId,
                title,
                description,
                notes,
            });
            res.status(201).json({
                id: reg._id,
                message: "The file was successfully saved. ",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: 'new CRUDOperationError().toJSON(),'
            });
        }
    }
];
export default createOne;