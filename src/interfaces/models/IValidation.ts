import {ObjectId} from "mongodb";
import {Schema} from "mongoose";

export default interface IValidation {
    user: Schema.Types.ObjectId | string,
    uploadDate?: Date | string,
    validation: boolean
}