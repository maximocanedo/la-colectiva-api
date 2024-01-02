import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";

export default interface IBoat {
    _id: Schema.Types.ObjectId | string,
    mat: string,
    name: string,
    status: boolean,
    enterprise: Schema.Types.ObjectId | string,
    user: Schema.Types.ObjectId | string,
    uploadDate: Date | string | number,
    active: boolean,
    comments?: ObjectId[] | string[],
    validations: IValidation[],
    pictures?: ObjectId[] | string[],
}