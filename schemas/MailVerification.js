'use strict';
const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const MailVerificationSchema = new mongoose.Schema({
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

module.exports = mongoose.model("MailVerification", MailVerificationSchema);