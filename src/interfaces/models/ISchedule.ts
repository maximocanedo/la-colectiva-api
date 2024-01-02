import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";
import ICommentable from "./ICommentable";
import IValidatable from "./IValidatable";

export default interface ISchedule extends ICommentable, IValidatable {
    _id: Schema.Types.ObjectId | string;
    path: Schema.Types.ObjectId | string;
    dock: Schema.Types.ObjectId | string;
    time: Date;
    user: Schema.Types.ObjectId | string;
    uploadDate: Date;
    active: boolean;

}