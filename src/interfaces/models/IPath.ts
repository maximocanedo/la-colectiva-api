import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface IPath {
    _id: ObjectId | string;
    boat: ObjectId | string;
    user: ObjectId | string;
    title: string;
    description: string;
    notes: string;
    uploadDate: Date;
    active: boolean;
    comments?: ObjectId[] | string[];
    validations?: IValidation[];

}