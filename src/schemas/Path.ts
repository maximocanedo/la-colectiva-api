"use strict";
import mongoose, { Schema } from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import IPath from "../interfaces/models/IPath";
import HistoryEvent from "./HistoryEvent";

// const properties: string[] = ["boat", "user", "title", "description", "notes"];

interface IPathModel extends mongoose.Model<IPath> { }

const pathSchema: Schema<IPath, IPathModel> = new Schema<IPath, IPathModel>({
    boat: {
        type: Schema.Types.ObjectId,
        ref: "Boat",
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 48,
        minlength: 3,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
        maxlength: 128,
        minlength: 3,
        required: true,
    },
    notes: {
        type: String,
        maxlength: 256,
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    comments: [
        {
            type: ObjectId,
            ref: "Comment",
        },
    ],
    history: {
        type: [ HistoryEvent ],
        select: false
    },
    validations: [ ValidationSchema ],
});


export default mongoose.model<IPath, IPathModel>("Path", pathSchema);