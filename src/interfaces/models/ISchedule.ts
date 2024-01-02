import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";

export default interface ISchedule {
    _id: Schema.Types.ObjectId | string;
    path: Schema.Types.ObjectId | string;
    dock: Schema.Types.ObjectId | string;
    time: Date;
    user: Schema.Types.ObjectId | string;
    uploadDate: Date;
    active: boolean;
    comments: ObjectId[] | string[];
    validations: IValidation[];

}