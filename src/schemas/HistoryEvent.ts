'use strict';
import { Schema } from "mongoose";

export interface IHistoryEvent {
    content: string,
    time: Date | number | string,
    user: Schema.Types.ObjectId | string
}
const HistoryEvent: Schema<IHistoryEvent> = new Schema<IHistoryEvent>({
    content: {
        type: String,
        max: 100
    },
    time: {
        type: Date,
        default: Date.now
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});
export default HistoryEvent;