import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";

export default interface IWaterBody {
    _id: Schema.Types.ObjectId | string;
    name: string;
    user: Schema.Types.ObjectId | string;
    type: number;
    uploadDate: Date;
    active: boolean;
    comments: ObjectId[] | string[];
    validations: IValidation[];

}