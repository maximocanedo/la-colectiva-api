import {ObjectId} from "mongodb";

export default interface IValidation {
    user: ObjectId | string,
    uploadDate?: Date | string,
    validation: boolean
}