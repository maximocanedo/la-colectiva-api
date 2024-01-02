'use strict';
import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";



const MailVerificationSchema: Schema = new Schema({
    code: {
        type: String,
        required: true,
    },
    user: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    active: {
        type: Boolean,
        required: true,
        default: false,
    },
    expirationDate: {
        type: Date,
        required: true,
        default: Date.now() + 1000 * 60 * 60 * 24,
    },
    mail: {
        type: String,
        required: true,
    }
});

export default mongoose.model("MailVerification", MailVerificationSchema);