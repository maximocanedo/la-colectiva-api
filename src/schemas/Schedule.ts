"use strict";
import mongoose, {FilterQuery, Schema } from "mongoose";
import { ObjectId } from "mongodb";
import IValidation from "../interfaces/models/IValidation";
import Comment from "./Comment";
import ValidationSchema from "./Validation";
import moment from "moment-timezone";
import ISchedule from "../interfaces/models/ISchedule";
import HistoryEvent from "./HistoryEvent";
import FetchResult from "../interfaces/responses/FetchResult";
import IScheduleView from "../interfaces/views/IScheduleView";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";

interface IExtra {
    q: string,
    p: number,
    itemsPerPage: number
}

interface IScheduleModel extends mongoose.Model<ISchedule> {
    listData(query: any, { page, itemsPerPage }: { page: number; itemsPerPage: number }): Promise<any>;
    formatTime(): void;
    findFormatted(query: FilterQuery<ISchedule>, extra: IExtra): Promise<FetchResult<IScheduleView>>;
}

const scheduleSchema: Schema<ISchedule, IScheduleModel> = new Schema<ISchedule, IScheduleModel>({
    path: {
        type: Schema.Types.ObjectId,
        ref: "Path",
        required: true,
    },
    dock: {
        type: Schema.Types.ObjectId,
        ref: "Dock",
        required: true,
    },
    time: {
        type: Date,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    uploadDate: {
        type: Date,
        required: true,
        default: moment.tz(Date.now(), "America/Argentina/Buenos_Aires"),
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    comments: [
        {
            type: ObjectId,
            ref: "Comment",
        },
    ],
    history: {
        type: [ HistoryEvent ],
        select: false
    },
    validations: [ValidationSchema],
});

scheduleSchema.statics.listData = async function (
    query,
    { page, itemsPerPage }
) {
    try {
        const resource = await this.find(query, {comments: 0, validations: 0})
            .sort({ name: 1 })
            .skip(page * itemsPerPage)
            .limit(itemsPerPage)
            .populate("user", "name _id")
            .populate({
                path: "path",
                model: "Path",
                select: "_id title boat",
                populate: {
                    path: "boat",
                    model: "Boat",
                    select: "_id name",
                },
            })
            .exec();

        if (!resource) {
            return {
                items: [],
                status: 404,
                error: null,
                msg: "Resource not found.",
            };
        }

        return {
            items: resource,
            status: 200,
            error: null,
            msg: "OK",
        };
    } catch (err) {
        console.log(err);
        return {
            items: [],
            status: 500,
            error: err,
            msg: "Could not fetch the comments.",
        };
    }
};


scheduleSchema.methods.formatTime = function(): void {
    this.time = this.time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

scheduleSchema.statics.findFormatted = async function(query: FilterQuery<ISchedule>, extra: IExtra = {
    q: "",
    p: 0,
    itemsPerPage: 10
}): Promise<FetchResult<IScheduleView>> {
    try {
        const skip: number = extra.p * extra.itemsPerPage;
        const found = await this.find(query)
            .populate({
                path: "path",
                model: "Path",
                select: "_id boat title description notes",
                populate: {
                    path: "boat",
                    model: "Boat",
                    select: "_id mat name",
                },
            })
            .populate({
                path: "dock",
                model: "Dock",
                select: "_id name address region coordinates"
            })
            .populate({
                path: "user",
                model: "User",
                select: "_id name username"
            })
            .select({ comments: 0, validations: 0 })
            .skip(skip)
            .limit(extra.itemsPerPage)
            .exec();
        const data: IScheduleView[] = [];
        found.forEach(resource => {
            const hours: string = new Date(resource.time).getUTCHours().toString().padStart(2, '0');
            const minutes: string = new Date(resource.time).getUTCMinutes().toString().padStart(2, '0');
            const { _id, path, dock, user, uploadDate, active } = resource;
            data.push({
                _id, path, dock, user, uploadDate, active,
                time: `${hours}:${minutes}`,
            } as IScheduleView);
        });
        return {
            status: 200,
            data
        }
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        return {
            error,
            data: [],
            status: 500
        };
    }
}

export default mongoose.model<ISchedule, IScheduleModel>("Schedule", scheduleSchema);