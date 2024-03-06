'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {Request, Response} from "express";
import Comment from "../../schemas/Comment";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import IUser from "../../interfaces/models/IUser";

const edit: endpoint[] = [
    pre.auth,
    pre.expect({
        content: V.comment.content.required()
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { content } = req.body;

            let comment = await Comment.findOne({ _id: id, active: true });

            if (!comment) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            if(comment.user.toString() !== (<IUser>req.user)._id as string) {
                res.status(403).json({
                    error: E.UnauthorizedRecordModification
                }).end();
                return;
            }

            comment.content = content;
            comment.__v += 1;

            const updatedComment = await comment.save();

            res.status(200).json(updatedComment);
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default edit;