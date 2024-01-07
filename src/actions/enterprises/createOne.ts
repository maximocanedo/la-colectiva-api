'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {Request, Response, NextFunction} from "express";
import V from "./../../validators";
import E from "../../errors";
import {endpoint} from "../../interfaces/types/Endpoint";
import defaultHandler from "../../errors/handlers/default.handler";

const createOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        cuit: V.enterprise.cuit.required(),
        name: V.enterprise.name.required(),
        description: V.enterprise.description,
        foundationDate: V.enterprise.foundationDate,
        phones: V.enterprise.phones
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { cuit } = req.body;
        if(!cuit) next();
        else {
            const reg = await Enterprise.findOne({ cuit });
            if(!reg) next();
            else {
                res.status(409).json({ error: E.DuplicationError }).end();
            }
        }
        return;
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { cuit } = req.body;
        const obj = await Enterprise.findOne({ cuit });
        if(!obj) next();
        else {
            res.status(400).json({
                error: E.DuplicationError
            }).end();
        }
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { cuit, name, description, foundationDate, phones } =
                req.body;
            const userId = req.user._id;
            let reg = await Enterprise.create({
                user: userId,
                cuit,
                name,
                description,
                foundationDate,
                phones,
            });
            res.status(201).json({
                id: reg._id,
                message: "The file was successfully saved. ",
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];
export default createOne;