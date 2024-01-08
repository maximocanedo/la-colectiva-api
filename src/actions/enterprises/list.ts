'use strict';
import Enterprise from "../../schemas/Enterprise";
import { Request, Response, NextFunction } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        let resources = await Enterprise.find({ active: true }, { validations: 0, comments: 0 });
        res.status(200).json(resources);
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
};
export default list;