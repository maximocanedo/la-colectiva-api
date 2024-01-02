"use strict";
import mongoose, {Model, Schema} from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import Photo from "./Photo";
import IDock from "../interfaces/models/IDock";

const DOCK_PROPERTY_STATUS: any = {
    PRIVATE: 0,
    PUBLIC: 1,
    BUSINESS: 2,
};

interface IDockModel extends Model<IDock> {
    listData(query: any, {page, itemsPerPage}: {page: number, itemsPerPage: number}): Promise<IDock[]>;
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
        default: DOCK_PROPERTY_STATUS.PRIVATE,
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
    pictures: [
        {
            type: ObjectId,
            ref: "Photo",
        },
    ],
});

dockSchema.statics.listData = async function (query, { page, itemsPerPage }) {
    try {
        const resource = await this.find(query)
            .sort({ name: 1 })
            .skip(page * itemsPerPage)
            .limit(itemsPerPage)
            .populate("user", "name _id")
            .populate("region", "name type")
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