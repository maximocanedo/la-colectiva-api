'use strict';

import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import {Model, Schema} from "mongoose";
import {endpoint} from "../../interfaces/types/Endpoint";
import Comment from "../../schemas/Comment";
import V from "../../validators";

async function addCommentForModel(Model: Model<any> | any, resId: string, content: string, userId: Schema.Types.ObjectId | string) {
    try {
        const doc = await Model.findOne({ _id: resId, active: true });
        if(!doc) {
            return {
                comment: [],
                status: 404,
                error: null,
                msg: "Resource not found.",
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
                error: null,
                msg: "Resource not found.",
            };
        }

        return {
            comment: resource,
            status: 201,
            error: null,
            msg: "",
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
            const resId: string = req.params.id;
            const content: string = req.body.content;
            const userId: string = req.user._id;

            const result = await addCommentForModel(model, resId, content, userId);
            if (result.error) {
                console.error(result.error);
                res.status(500).json({
                    message: result.msg,
                });
            }

            res.status(201).json({
                comment: result.comment,
                message: "Comment added",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal error",
            });
        }
    }
];

export default post;