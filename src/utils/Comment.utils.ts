"use strict";
import mongoose, {Schema, Types, model, Model} from "mongoose";
import dotenv from "dotenv";
import express, {Router, Request, Response} from "express";
import pre from "./../endpoints/pre";
import Comment from "../schemas/Comment";
import ICommentable from "../interfaces/models/ICommentable";
import {CommentFetchResponse} from "../interfaces/responses/Comment.interfaces";
import E from "../errors";

dotenv.config();

const router: Router = express.Router();


async function listCommentsForModel(
    Model: Model<any> | any,
    { resId, page, itemsPerPage }: { resId: string, page: number, itemsPerPage: number }
): Promise<CommentFetchResponse> {
    try {
        const resource = await Model.findById(resId)
            .select("comments")
            .populate({
                path: "comments",
                match: { active: true },
                populate: {
                    path: "user",
                    model: "User",
                    select: "name username", // Cambia "name" a "fullName" si ese es el campo de nombre completo en tu modelo de usuario
                },
                options: {
                    sort: { uploadDate: 1 },
                    skip: page * itemsPerPage,
                    limit: itemsPerPage,
                },
            })
            .exec();

        if (!resource) {
            return {
                comments: [],
                status: 404,
                error: E.ResourceNotFound,
                msg: "Resource not found.",
            };
        }

        return {
            comments: resource.comments,
            status: 200,
            error: null,
            msg: "",
        };
    } catch (err) {
        return {
            comments: [],
            status: 500,
            error: E.CRUDOperationError,
            msg: "Could not fetch the comments.",
        };
    }
}
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
function handleGetComments(router: Router, Model: Model<any> | any) {
    router.get("/:id/comments", async (req: Request, res: Response) => {
        try {
            const resId: string = req.params.id;
            const page: number = parseInt((req.query.p?? 0) as string);
            const itemsPerPage: number = parseInt((req.query.itemsPerPage?? 10) as string);
            const result: CommentFetchResponse = await listCommentsForModel(Model, {
                resId,
                page,
                itemsPerPage,
            });
            res.status(result.status).json(result);
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal error",
            });
        }
    });
}

function handlePostComment(router: Router, Model: Model<any> | any): void {
    router.post(
        "/:id/comments",
        pre.auth,
        pre.allow.normal,
        pre.verifyInput(["content"]),
        async (req: Request, res: Response): Promise<void> => {
            try {
                const resId = req.params.id;
                const content = req.body.content;
                const userId = req.user._id;

                const result = await addCommentForModel(Model, resId, content, userId);
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
    );
}
function handleComments(router: Router, Model: Model<any> | any) {
    handlePostComment(router, Model);
    handleGetComments(router, Model);
}
export { listCommentsForModel, addCommentForModel, handleGetComments, handlePostComment, handleComments };