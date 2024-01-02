'use strict';
import mongoose, {Model, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import IMailVerification from "../interfaces/models/IMailVerification";

interface IMailVerificationModel extends Model<IMailVerification> {

}

const MailVerificationSchema: Schema<IMailVerification, IMailVerificationModel> = new Schema<IMailVerification, IMailVerificationModel>({
    code: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
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

export default mongoose.model<IMailVerification, IMailVerificationModel>("MailVerification", MailVerificationSchema);