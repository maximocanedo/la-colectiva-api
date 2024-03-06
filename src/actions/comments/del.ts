'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import Comment from "../../schemas/Comment";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import {Model} from "mongoose";
import IComment from "../../interfaces/models/IComment";

const del = (model: Model<any> | any): endpoint[] => ([
    pre.auth,
    pre.allow.normal,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id, commentId } = req.params;
            const { success, status, message } = await Comment.delete(commentId);
            const file = await model.findOne({ _id: id, active: true }, { comments: 1 });
            if(!file) {
                res.status(404).json({error: E.ResourceNotFound});
                return;
            }
            file.comments = file.comments.filter((x: any): boolean => (x).toString() !== commentId);
            const f = await file.save();


            if (!success && f !== null) {
                res.status(status).json({ message });
                return;
            }
            res.status(status).json({ message });
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error });
        }
    }
]);

export default del;