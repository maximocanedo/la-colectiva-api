import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";

export default interface IPath {
    _id: Schema.Types.ObjectId | string;
    boat: Schema.Types.ObjectId | string;
    user: Schema.Types.ObjectId | string;
    title: string;
    description: string;
    notes: string;
    uploadDate: Date;
    active: boolean;
    comments: ObjectId[] | string[];
    validations: IValidation[];

}