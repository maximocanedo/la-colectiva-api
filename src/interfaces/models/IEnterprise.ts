import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface IEnterprise {
    _id: ObjectId | string,
    cuit: number,
    name: string,
    user: ObjectId | string,
    description?: string,
    uploadDate: Date | string | number,
    foundationDate: Date | string | number,
    phones?: string[],
    active: boolean,
    comments?: ObjectId[] | string[],
    validations?: IValidation[],
}