"use strict";
import mongoose, {FilterQuery, Model, Schema} from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import Photo from "./Photo";
import IDock from "../interfaces/models/IDock";
import HistoryEvent from "./HistoryEvent";
import FetchResult from "../interfaces/responses/FetchResult";
import {RegionType} from "./WaterBody";
import defaultHandler from "../errors/handlers/default.handler";
import {IError} from "../interfaces/responses/Error.interfaces";
import E from "../errors";

const DOCK_PROPERTY_STATUS: any = {
    PRIVATE: 0,
    PUBLIC: 1,
    BUSINESS: 2,
};

export enum PropertyStatus {
    /**
     * Muelle de uso privado.
     */
    PRIVATE = 0,
    /**
     * Muelle de uso público.
     */
    PUBLIC = 1,
    /**
     * Muelle de uso comercial.
     */
    BUSINESS = 2,
    /**
     * Muelle de uso gubernamental.
     */
    GOVERNMENT = 3,
    /**
     * Otro tipo de muelle.
     */
    OTHER = 4,
    /**
     * Se desconoce el tipo de muelle.
     */
    UNLISTED = 5
}

export type OID = Schema.Types.ObjectId | string;

export interface IDockView {
    _id: OID;
    name: string;
    address: number;
    notes: string;
    status: PropertyStatus;
    region: {
        _id: OID;
        name: string;
        type: RegionType;
    };
    user: {
        _id: OID;
        name: string;
        username: string;
    };
    uploadDate: Date | string;
    active: boolean;
    __v: number;
}

interface IDockModel extends Model<IDock> {
    listData(query: FilterQuery<IDock>, {page, itemsPerPage}: {page: number, itemsPerPage: number}): Promise<FetchResult<IDockView>>;
    linkPhoto(resId: string, picId: string): Promise<any>;
}

const dockSchema: Schema<IDock, IDockModel> = new Schema<IDock, IDockModel>({
    name: {
        type: String,
        maxlength: 48,
        minlength: 3,
        required: true,
    },
    address: {
        type: Number,
        required: false,
    },
    region: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "WaterBody",
    },
    notes: {
        type: String,
        required: false,
        maxlength: 128,
    },
    status: {
        type: Number,
        required: true,
        default: PropertyStatus.PRIVATE,
        enum: [ 0, 1, 2, 3, 4, 5 ]
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
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
    validations: [ValidationSchema],
    coordinates: {
        type: [Number], // Array de números
        required: true,
    },
    history: {
      select: false,
      type: [ HistoryEvent ]
    },
    pictures: [
        {
            type: ObjectId,
            ref: "Photo",
        },
    ],
});

dockSchema.statics.listData = async function (query: FilterQuery<IDock>, { page, itemsPerPage }): Promise<FetchResult<IDockView>> {
    try {
        const skip: number = page * itemsPerPage;
        const files = await this.find(query)
            .select({ comments: 0, validations: 0, pictures: 0 })
            .populate({
                path: "region",
                model: "WaterBody",
                select: "_id name type"
            })
            .populate({
                path: "user",
                model: "User",
                select: "_id name username"
            })
            .skip(skip)
            .limit(itemsPerPage);
        return {
            data: files as unknown as IDockView[],
            status: 200,
            error: null
        };
    } catch (err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        return {
            error,
            data: [],
            status: 500
        };
    }
};

dockSchema.statics.linkPhoto = async function (resId, picId) {
    try {
        // Crear el comentario y guardarlo
        const actualPhoto = await Photo.findOne({ _id: picId });
        if (!actualPhoto)
            return {
                status: 404,
            };
        await this.updateOne(
            { _id: resId },
            { $push: { pictures: actualPhoto._id } }
        );
        return {
            status: 201,
        };
    } catch (error) {
        console.log(error);
        return {
            status: 500,
        };
    }
};
export default mongoose.model<IDock, IDockModel>("Dock", dockSchema);