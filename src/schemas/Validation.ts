"use strict";
import { Schema } from "mongoose";
import { ObjectId } from "mongodb";

const ValidationSchema: Schema = new Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    validation: {
        type: Boolean,
        required: true,
        default: true,
    },
});

export default ValidationSchema;
