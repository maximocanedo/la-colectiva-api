'use strict';

import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import {Model, Schema} from "mongoose";
import {endpoint} from "../../interfaces/types/Endpoint";
import Comment from "../../schemas/Comment";
import V from "../../validators";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import IComment from "../../interfaces/models/IComment";

interface CommentCreationResponse {
    comment: IComment[],
    status: number,
    error: IError | null
}

const addCommentForModel = async (Model: Model<any> | any, resId: string, content: string, userId: Schema.Types.ObjectId | string): Promise<CommentCreationResponse> => {
    try {
        const doc = await Model.findOne({ _id: resId, active: true });
        if(!doc) {
            return {
                comment: [],
                status: 404,
                error: E.ResourceNotFound
            };
        }
        // Crear el comentario y guardarlo
        const newComment = await Comment.create({
            user: userId,
            content: content,
        });

        await Model.updateOne(
            { _id: resId },
            { $push: { comments: newComment._id } }
        );
        const resource = await Comment.findById(newComment._id)
            .select("user content uploadDate active _v _id")
            .populate({
                path: "user",
                match: { active: true },
                model: "User",
                select: "name username"
            })
            .exec();

        if (!resource) {
            return {
                comment: [],
                status: 404,
                error: E.ResourceNotFound
            };
        }

        return {
            comment: [resource],
            status: 201,
            error: null
        };
    } catch (error) {
        throw error;
    }
}
const post = (model: Model<any> | any): endpoint[] => [
    pre.auth,
    pre.allow.normal,
    pre.expect({
        content: V.comment.content.required()
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId: string = req.user._id;
            const { comment, error, status }: CommentCreationResponse = await addCommentForModel(model, id, content, userId);
            res.status(status).json({ comment, error }).end();
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default post;