"use strict";
import mongoose, {FilterQuery, Model, Schema, Types} from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import {IBoatListDataResponse} from "../interfaces/responses/Boat.interfaces";
import Photo from "./Photo";
import IBoat from "../interfaces/models/IBoat";
import HistoryEvent from "./HistoryEvent";
import FetchResult from "../interfaces/responses/FetchResult";
import {OID} from "./Dock";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";


const requiredProps: string[] = ["mat", "name", "status", "enterprise", "user"];



export interface IBoatView {
    _id: OID;
    mat: string;
    name: string;
    status: boolean;
    enterprise: {
        _id: OID;
        name: string;
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

interface IBoatModel extends Model<IBoat> {
    listData(query: FilterQuery<IBoat>, { page, size }: {page: number, size: number}): Promise<FetchResult<IBoatView>>;
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
    history: {
        type: [ HistoryEvent ],
        select: false
    },
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
boatSchema.statics.listData = async function (query: FilterQuery<IBoat>, { page, size }: {page: number, size: number}): Promise<FetchResult<IBoatView>> {
    try {
        const skip: number = page * size;
        const files = await this.find(query)
            .select({ comments: 0, validations: 0, pictures: 0 })
            .populate({
                path: "enterprise",
                model: "Enterprise",
                select: "_id name"
            })
            .populate({
                path: "user",
                model: "User",
                select: "_id name username"
            })
            .skip(skip)
            .limit(size);
        return {
            status: 200,
            data: files as unknown as IBoatView[],
            error: null
        };
    } catch(err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        return {
            error,
            data: [],
            status: 500
        };
    }
}
/**
 * Método para enlazar una foto a un recurso.
 * @param resId ID del recurso al que se desea enlazar la foto.
 * @param picId ID de la foto que se desea enlazar.
 * @param userId ID del usuario que está enlazando la imagen.
 */
boatSchema.statics.linkPhoto = async function (resId, picId, userId: string) {
    try {
        // Crear el comentario y guardarlo
        const actualPhoto = await Photo.findOne({ _id: picId });
        if (!actualPhoto)
            return {
                status: 404,
            };
        await this.updateOne(
            { _id: resId },
            {
                $push: {
                    pictures: actualPhoto._id,
                    history: {
                        content: "Vincular una imagen (@" + actualPhoto._id + ")",
                        time: Date.now(),
                        user: userId
                    }
                }
            }
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