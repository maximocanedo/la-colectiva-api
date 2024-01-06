import {ObjectId} from "mongodb";
import mongoose, {Schema, Types} from "mongoose";
import IValidation from "./IValidation";
import ICommentable from "./ICommentable";
import IValidatable from "./IValidatable";

export default interface IPicture extends ICommentable, IValidatable, mongoose.Document<Types.ObjectId> {
    _id: Types.ObjectId;
    filename: string;
    user: Schema.Types.ObjectId | string;
    description?: string;
    uploadDate: Date | string | number;
    active: boolean;
}