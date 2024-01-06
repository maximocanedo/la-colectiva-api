"use strict";
import mongoose, {Model, Schema, Types} from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import {IBoatListDataResponse} from "../interfaces/responses/Boat.interfaces";
import Photo from "./Photo";
import IBoat from "../interfaces/models/IBoat";


const requiredProps: string[] = ["mat", "name", "status", "enterprise", "user"];

interface IBoatModel extends Model<IBoat> {
    listData(query: any, {page, itemsPerPage}: {page: number, itemsPerPage: number}): Promise<IBoatListDataResponse>;
    linkPhoto(resId: string, picId: string): Promise<{status: number}>;
}

const boatSchema: Schema<IBoat, IBoatModel> = new Schema<IBoat, IBoatModel>({
    mat: {
        type: String,
        minlength: 2,
        maxlength: 16,
        required: false,
    },
    name: {
        type: String,
        maxlength: 48,
        minlength: 3,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
        default: true,
    },
    enterprise: {
        type: Schema.Types.ObjectId,
        ref: "Enterprise",
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
    pictures: [
        {
            type: ObjectId,
            ref: "Photo",
        },
    ],
});
/**
 * Método para listar embarcaciones.
 * @param query Filtros de búsqueda.
 * @param page Número de página.
 * @param itemsPerPage Número de elementos por página.
 */
boatSchema.statics.listData = async function (query, { page, itemsPerPage }): Promise<IBoatListDataResponse> {
    try {
        const resource = await this.find(query)
            .sort({ name: 1 })
            .skip(page * itemsPerPage)
            .limit(itemsPerPage)
            .populate("user", "name _id")
            .populate("enterprise", "name _id")
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
            msg: "Could not fetch the data.",
        };
    }
};

/**
 * Método para enlazar una foto a un recurso.
 * @param resId ID del recurso al que se desea enlazar la foto.
 * @param picId ID de la foto que se desea enlazar.
 */
boatSchema.statics.linkPhoto = async function (resId, picId) {
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
export default mongoose.model<IBoat, IBoatModel>("Boat", boatSchema);