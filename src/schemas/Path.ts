"use strict";
import mongoose, {FilterQuery, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IPath from "../interfaces/models/IPath";
import HistoryEvent from "./HistoryEvent";
import FetchResult from "../interfaces/responses/FetchResult";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";

// const properties: string[] = ["boat", "user", "title", "description", "notes"];

export interface IPathView {
    _id: Schema.Types.ObjectId | string;
    boat: {
        _id: Schema.Types.ObjectId | string;
        name: string;
        mat: string;
        enterprise: Schema.Types.ObjectId | {
            _id: Schema.Types.ObjectId | string;
            name: string;
        }
    };
    title: string;
    user: {
        _id: Schema.Types.ObjectId | string;
        name: string;
        username: string;
    };
    description: string;
    notes: string;
    uploadDate: Date | string;
    active: boolean;
    __v: number;
}

interface IPathModel extends mongoose.Model<IPath> {
    listData(query: FilterQuery<IPath>, { page, size }: { page: number, size: number }): Promise<FetchResult<IPathView>>;
}

const pathSchema: Schema<IPath, IPathModel> = new Schema<IPath, IPathModel>({
    boat: {
        type: Schema.Types.ObjectId,
        ref: "Boat",
        required: true,
    },
    title: {
        type: String,
        required: true,
        maxlength: 48,
        minlength: 3,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
        maxlength: 128,
        minlength: 3,
        required: true,
    },
    notes: {
        type: String,
        maxlength: 256,
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now(),
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
    validations: [ ValidationSchema ],
});

pathSchema.statics.listData = async function(query: FilterQuery<IPath>, { page, size }): Promise<FetchResult<IPathView>> {
    try {
        const skip: number = page * size;
        const res = await this.find(query)
            .select({ validations: 0, comments: 0 })
            .populate({
                path: "user",
                model: "User",
                select: "_id username name"
            })
            .populate({
                path: "boat",
                model: "Boat",
                select: "_id name enterprise",
                populate: {
                    path: "enterprise",
                    model: "Enterprise",
                    select: "_id name"
                }
            })
            .skip(skip)
            .limit(size);
        return {
            data: res as unknown as IPathView[],
            status: 200,
            error: null
        };
    } catch(err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        return {
            error,
            data: [],
            status: 500
        };
    }
};

export default mongoose.model<IPath, IPathModel>("Path", pathSchema);