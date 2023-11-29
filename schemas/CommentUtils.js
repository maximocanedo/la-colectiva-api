"use strict";
// Crea un nuevo archivo, por ejemplo, commentUtils.js
const mongoose = require("mongoose");
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Enterprise = require("./Enterprise");
const pre = require("./../endpoints/pre");
const Comment = require("./Comment");
const Path = require("./Path");

async function listCommentsForModel(Model, { resId, page, itemsPerPage }) {
    try {
        const resource = await Model.findById(resId)
            .select("comments")
            .populate({
                path: "comments",
                match: { active: true },
                populate: {
                    path: "user",
                    model: "User",
                    select: "name", // Cambia "name" a "fullName" si ese es el campo de nombre completo en tu modelo de usuario
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
                error: null,
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
            error: err,
            msg: "Could not fetch the comments.",
        };
    }
}
async function addCommentForModel(Model, resId, content, userId) {
    try {
        // Crear el comentario y guardarlo
        const newComment = await Comment.create({
            user: userId,
            content: content,
        });

        await Model.updateOne(
            { _id: resId },
            { $push: { comments: newComment._id } }
        );

        return {
            newComment,
            status: 201,
        };
    } catch (error) {
        throw error;
    }
}
function handleGetComments(router, Model) {
    router.get("/:id/comments", async (req, res) => {
        try {
            const resId = req.params.id;
            const page = req.query.p || 0;
            const itemsPerPage = req.query.itemsPerPage || 10;
            const result = await listCommentsForModel(Model, {
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

function handlePostComment(router, Model) {
    router.post(
        "/:id/comments",
        pre.auth,
        pre.allow.normal,
        pre.verifyInput(["content"]),
        async (req, res) => {
            try {
                const resId = req.params.id;
                const content = req.body.content;
                const userId = req.user._id;

                const result = await addCommentForModel(Model, resId, content, userId);
                if (result.error) {
                    console.error(result.error);
                    return res.status(500).json({
                        message: result.msg,
                    });
                }

                res.status(201).json({
                    comment: result.newComment,
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
function handleComments(router, Model) {
    handlePostComment(router, Model);
    handleGetComments(router, Model);
}
module.exports = { listCommentsForModel, addCommentForModel, handleGetComments, handlePostComment, handleComments };
