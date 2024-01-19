'use strict';
import pre from "../../endpoints/pre";
import Path from "../../schemas/Path";
import Boat from "../../schemas/Boat";
import {NextFunction, Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";

const createOne = [
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
            const { boat, title, description, notes } = req.body;
            const userId = req.user._id;
            let reg = await Path.create({
                boat,
                user: userId,
                title,
                description,
                notes,
                history: [
                    {
                        content: "Creación del recurso. ",
                        time: Date.now(),
                        user: req.user._id
                    }
                ]
            });
            res.status(201).json({
                id: reg._id
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];
export default createOne;