'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import {Request, Response} from "express";
import Comment from "../../schemas/Comment";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";

const getOne: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            let comment = await Comment.findOne({
                _id: id,
                active: true,
            }).populate({
                path: "user",
                model: "User",
                select: "name _id"
            });

            if (!comment) {
                res.status(404).json({ error: E.ResourceNotFound });
                return;
            }

            res.status(200).json(comment);
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default getOne;