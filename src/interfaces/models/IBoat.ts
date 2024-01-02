import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface IBoat {
    _id: ObjectId | string,
    mat: string,
    name: string,
    status: boolean,
    enterprise: ObjectId | string,
    user: ObjectId | string,
    uploadDate: Date | string | number,
    active: boolean,
    comments?: ObjectId[] | string[],
    validations?: IValidation[],
    pictures?: ObjectId[] | string[],
}