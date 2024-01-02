import {ObjectId} from "mongodb";

export default interface IComment {
    _id: ObjectId | string,
    user: ObjectId | string,
    content: string,
    uploadDate: Date | string,
    active: boolean
}