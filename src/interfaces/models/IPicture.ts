import {ObjectId} from "mongodb";
import mongoose, {Schema, Types} from "mongoose";
import IValidation from "./IValidation";

export default interface IPicture extends mongoose.Document<Types.ObjectId> {
    _id: Types.ObjectId;
    filename: string;
    user: Schema.Types.ObjectId | string;
    description?: string;
    uploadDate: Date | string | number;
    active: boolean;
    comments: Types.ObjectId[] | string[];
    validations: IValidation[];

}