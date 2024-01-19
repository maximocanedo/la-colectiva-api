'use strict';

import { endpoint } from "../../interfaces/types/Endpoint";
import { Request, Response } from "express";
import { CommentFetchResponse } from "../../interfaces/responses/Comment.interfaces";
import { Model } from "mongoose";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";

interface CommentFetchPaginatorDetails {
    resId: string,
    page: number,
    itemsPerPage: number
}

const listCommentsForModel = async (
    Model: Model<any> | any,
    { resId, page, itemsPerPage }: CommentFetchPaginatorDetails
): Promise<CommentFetchResponse> => {
    try {
        const resource = await Model.findById(resId)
            .select("comments")
            .populate({
                path: "comments",
                match: { active: true },
                populate: {
                    path: "user",
                    model: "User",
                    select: "name username",
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

const fetch = (model: Model<any> | any): endpoint[] => [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const resId: string = req.params.id;
            const page: number = parseInt((req.query.p?? 0) as string);
            const itemsPerPage: number = parseInt((req.query.itemsPerPage?? 10) as string);
            const { status, comments, error }: CommentFetchResponse = await listCommentsForModel(model, {
                resId,
                page,
                itemsPerPage,
            });
            res.status(status).json({ comments, error }).end();
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default fetch;