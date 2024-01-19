"use strict";
import { Model } from "mongoose";
import { Router } from "express";
import comments from "./../actions/comments"


const handleComments = (router: Router, model: Model<any> | any): void => {
    router
        .post("/:id/comments",comments.post(model))
        .get("/:id/comments", comments.fetch(model));
}

export { handleComments };