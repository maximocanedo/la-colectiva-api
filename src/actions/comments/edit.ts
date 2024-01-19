'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import V from "../../validators";
import {Request, Response} from "express";
import Comment from "../../schemas/Comment";
import E from "../../errors";

const edit: endpoint[] = [
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
            if(comment.user.toString() !== req.user._id.toString()) {
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
            res.status(500).json({ error: E.InternalError });
        }
    }
];

export default edit;