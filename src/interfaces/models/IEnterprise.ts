import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";

export default interface IEnterprise {
    _id: Schema.Types.ObjectId | string,
    cuit: number,
    name: string,
    user: Schema.Types.ObjectId | string,
    description?: string,
    uploadDate: Date | string | number,
    foundationDate: Date | string | number,
    phones: string[],
    active: boolean,
    comments: ObjectId[] | string[],
    validations: IValidation[],
}