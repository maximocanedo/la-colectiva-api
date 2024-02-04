'use strict';
import {Schema} from "mongoose";
import {IHistoryEvent} from "../../schemas/HistoryEvent";

export type TimeView = `${string}${string}:${string}${string}`;

export default interface IScheduleView {
    _id: Schema.Types.ObjectId | string;
    path: {
        _id: Schema.Types.ObjectId | string,
        boat?: {
            _id: Schema.Types.ObjectId | string,
            mat?: string,
            name?: string
        } | Schema.Types.ObjectId | string,
        title?: string,
        description?: string,
        notes?: string
    } | Schema.Types.ObjectId | string;
    dock: {
        _id: Schema.Types.ObjectId | string,
        name?: string,
        address?: number,
        region?: Schema.Types.ObjectId | string,
        coordinates?: [number, number]
    } | Schema.Types.ObjectId | string;
    time: TimeView | string;
    user: {
        _id: Schema.Types.ObjectId | string,
        name?: string,
        username?: string
    } | Schema.Types.ObjectId | string;
    uploadDate: Date;
    active?: boolean;

}