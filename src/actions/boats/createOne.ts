'use strict';

import Boat from "../../schemas/Boat";
import {NextFunction, Request, Response} from "express";
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";



const createOne = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput(["mat", "name", "status", "enterprise"]),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { enterprise } = req.body;
        const enterprise_obj = await Enterprise.findOne({ _id: enterprise, active: true });
        if(!enterprise_obj) res.status(404).json({
            error: 'new ResourceNotFoundException('
        }).end();
        else next();
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { mat } = req.body;
        const boat = await Boat.findOne({ mat, active: true });
        if(boat) res.status(409).json({
            error: ''
        }).end();
        else next();
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { mat, name, status, enterprise } = req.body;
            const user = req.user._id;
            await Boat.create({
                mat,
                name,
                status,
                enterprise,
                user,
            });
            res.status(201).end();
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: 'new CRUDOperationError().toJSON()'
            }).end();
        }
    }
];

export default createOne;