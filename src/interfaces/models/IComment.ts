import {ObjectId} from "mongodb";
import {Schema} from "mongoose";
import {IHistoryEvent} from "../../schemas/HistoryEvent";

export default interface IComment {
    _id: Schema.Types.ObjectId | string,
    user: Schema.Types.ObjectId | string,
    content: string,
    uploadDate: Date | string,
    active: boolean
}