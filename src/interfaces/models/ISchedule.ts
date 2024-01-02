import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface ISchedule {
    _id: ObjectId | string;
    path: ObjectId | string;
    dock: ObjectId | string;
    time: Date;
    user: ObjectId | string;
    uploadDate: Date;
    active: boolean;
    comments?: ObjectId[] | string[];
    validations?: IValidation[];

}