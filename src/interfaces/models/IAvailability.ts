import {ObjectId} from "mongodb";
import IValidation from "./IValidation";
import {Schema} from "mongoose";
import IValidatable from "./IValidatable";
import {IHistoryEvent} from "../../schemas/HistoryEvent";
import {AvailabilityCondition} from "../../schemas/Availability";

export default interface IAvailability extends IValidatable {
    _id: Schema.Types.ObjectId | string,
    path: Schema.Types.ObjectId | string;
    condition: AvailabilityCondition;
    available: boolean;
    user: Schema.Types.ObjectId | string;
    uploadDate: Date | string | number;
    active: boolean;
    history: IHistoryEvent[];
}