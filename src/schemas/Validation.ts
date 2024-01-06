"use strict";
import { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import IValidation from "../interfaces/models/IValidation";

const ValidationSchema: Schema<IValidation> = new Schema<IValidation>({
    user: {
        type: Schema.Types.ObjectId,
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
