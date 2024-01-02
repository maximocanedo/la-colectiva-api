import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface IPicture {
    _id: ObjectId | string,
    filename: string,
    user: ObjectId | string,
    description?: string,
    uploadDate: Date | string | number,
    active: boolean,
    comments?: ObjectId[] | string[],
    validations?: IValidation[],

}