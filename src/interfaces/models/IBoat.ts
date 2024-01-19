import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";
import IPictureable from "./IPictureable";
import IValidatable from "./IValidatable";
import ICommentable from "./ICommentable";
import IUser from "./IUser";
import {IHistoryEvent} from "../../schemas/HistoryEvent";

export default interface IBoat extends ICommentable, IValidatable, IPictureable {
    _id: Schema.Types.ObjectId | string,
    mat: string,
    name: string,
    status: boolean,
    enterprise: Schema.Types.ObjectId | string,
    user: IUser | Schema.Types.ObjectId | string,
    uploadDate: Date | string | number,
    history: IHistoryEvent[],
    active: boolean
}