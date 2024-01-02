import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";
import ICommentable from "./ICommentable";
import IValidatable from "./IValidatable";

export default interface IEnterprise extends IValidatable, ICommentable {
    _id: Schema.Types.ObjectId | string,
    cuit: number,
    name: string,
    user: Schema.Types.ObjectId | string,
    description?: string,
    uploadDate: Date | string | number,
    foundationDate: Date | string | number,
    phones: string[],
    active: boolean
}