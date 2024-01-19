import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";
import IValidatable from "./IValidatable";
import ICommentable from "./ICommentable";
import {IHistoryEvent} from "../../schemas/HistoryEvent";

export default interface IWaterBody extends ICommentable, IValidatable {
    _id: Schema.Types.ObjectId | string;
    name: string;
    user: Schema.Types.ObjectId | string;
    type: number;
    uploadDate: Date;
    active: boolean;
    history: IHistoryEvent[]
}