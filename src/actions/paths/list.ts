'use strict';
import Path from "../../schemas/Path";
import { Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
const list = [async (req: Request, res: Response): Promise<void> => {
    try {
        let resources = await Path.find({ active: true }, {comments: 0, validations: 0})
            .populate("user", "name _id")
            .populate("boat", "name _id");
        res.status(200).json(resources);
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({error});
    }
}];
export default list;