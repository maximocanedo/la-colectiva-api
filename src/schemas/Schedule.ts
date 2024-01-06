"use strict";
import mongoose, { Schema } from "mongoose";
import { ObjectId } from "mongodb";
import IValidation from "../interfaces/models/IValidation";
import Comment from "./Comment";
import ValidationSchema from "./Validation";
import moment from "moment-timezone";
import ISchedule from "../interfaces/models/ISchedule";


// const rp = ["path", "dock", "time"];
// const localDate = moment.tz(Date.now(), "America/Argentina/Buenos_Aires");

interface IScheduleModel extends mongoose.Model<ISchedule> {
    listData(query: any, { page, itemsPerPage }: { page: number; itemsPerPage: number }): Promise<any>;
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
    validations: [ValidationSchema],
});

scheduleSchema.statics.listData = async function (
    query,
    { page, itemsPerPage }
) {
    try {
        const resource = await this.find(query)
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

export default mongoose.model<ISchedule, IScheduleModel>("Schedule", scheduleSchema);