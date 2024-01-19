import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";
import IValidatable from "./IValidatable";
import ICommentable from "./ICommentable";
import {IHistoryEvent} from "../../schemas/HistoryEvent";

export default interface IPath extends ICommentable, IValidatable {
    _id: Schema.Types.ObjectId | string;
    boat: Schema.Types.ObjectId | string;
    user: Schema.Types.ObjectId | string;
    title: string;
    description: string;
    notes: string;
    uploadDate: Date;
    history: IHistoryEvent[];
    active: boolean;

}