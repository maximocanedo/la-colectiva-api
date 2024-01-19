import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import IPictureable from "./IPictureable";
import IValidatable from "./IValidatable";
import ICommentable from "./ICommentable";
import {IHistoryEvent} from "../../schemas/HistoryEvent";

export type DockPropertyStatus = 0 | 1 | 2;
export default interface IDock extends ICommentable, IValidatable, IPictureable {
    _id: ObjectId | string,
    name: string,
    address: number,
    region: ObjectId | string,
    notes: string,
    status: DockPropertyStatus,
    user: ObjectId | string,
    uploadDate: Date | string | number,
    active: boolean,
    coordinates: number[],
    history: IHistoryEvent[]
}