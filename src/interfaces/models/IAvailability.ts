import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";

export default interface IAvailability {
    _id: Schema.Types.ObjectId | string,
    path: Schema.Types.ObjectId | string;
    condition: string;
    available: boolean;
    user: Schema.Types.ObjectId | string;
    uploadDate: Date | string | number;
    active: boolean;
    validations: IValidation[];
}