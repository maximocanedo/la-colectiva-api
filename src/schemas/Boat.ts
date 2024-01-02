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
    //getValidations(wbId: string, userId: string): Promise<IAvailabilityResponseSample>;
    //validate(resId: string, userId: string, validates: boolean): Promise<IAvailabilityResponseSample>;
    //deleteValidation(userId: string, resId: string): Promise<number>;
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
 * Método para obtener las validaciones de un recurso.
 * @deprecated Función obsoleta.
 * @param wbId ID del recurso del que se desea obtener las validaciones.
 * @param userId ID del usuario que desea obtener las validaciones.
 */
boatSchema.statics.getValidations = async function (wbId, userId) {
    try {
        const aggregationResult = await this.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(wbId) } },
            {
                $project: {
                    validations: {
                        $filter: {
                            input: "$validations",
                            as: "validation",
                            cond: {
                                $ne: ["$$validation.validation", null],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    inFavorCount: {
                        $size: {
                            $filter: {
                                input: "$validations",
                                as: "validation",
                                cond: { $eq: ["$$validation.validation", true] },
                            },
                        },
                    },
                    againstCount: {
                        $size: {
                            $filter: {
                                input: "$validations",
                                as: "validation",
                                cond: { $eq: ["$$validation.validation", false] },
                            },
                        },
                    },
                    userVote: {
                        $cond: {
                            if: {
                                $ne: [
                                    {
                                        $indexOfArray: [
                                            "$validations.user",
                                            new mongoose.Types.ObjectId(userId),
                                        ],
                                    },
                                    -1,
                                ],
                            },
                            then: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            "$validations.validation",
                                            true,
                                        ],
                                    },
                                    then: true,
                                    else: false,
                                },
                            },
                            else: null,
                        },
                    },
                },
            },
        ]);

        if (aggregationResult.length === 0) {
            return {
                success: false,
                status: 404,
                message: "Resource not found",
            };
        }

        const { inFavorCount, againstCount, userVote } = aggregationResult[0];

        return {
            success: true,
            status: 200,
            message: "Validations retrieved",
            inFavorCount,
            againstCount,
            userVote,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 500,
            message: "Could not retrieve validations",
        };
    }
};
/**
 * Método para validar un recurso.
 * @deprecated Función obsoleta.
 * @param resId ID del recurso que se desea validar.
 * @param userId ID del usuario que realiza la validación.
 * @param validates Valor de la validación.
 */
boatSchema.statics.validate = async function (resId, userId, validates) {
    try {
        const resource = await this.findById(resId);
        if (!resource) {
            return {
                success: false,
                status: 404,
                message: "Resource not found",
            };
        }

        // Buscar si el usuario ya tiene una validación en este registro
        const existingValidation = resource.validations.find((validation: IValidation) => {
            return validation.user.toString() === userId.toString();
        });

        if (existingValidation) {
            // Si ya existe una validación, actualizar su estado
            existingValidation.validation = validates;
        } else {
            // Si no existe, crear una nueva validación
            resource.validations.push({
                user: userId,
                validation: validates,
            });
        }

        await resource.save();

        return {
            success: true,
            status: 200,
            message: "Validation saved",
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: "Could not save validation",
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
/**
 * Método para eliminar una validación de un recurso.
 * @deprecated Función obsoleta.
 * @param userId ID del usuario que desea eliminar su validación.
 * @param resId ID del recurso al que se le desea eliminar la validación.
 */
boatSchema.statics.deleteValidation = async function (userId, resId) {
    const res = await this.findById(resId);
    if (!res) return 404;
    // Remove the validation from the validations array in the availability document
    const index = res.validations.findIndex(
        (item: IValidation): boolean => item.user.toString() === userId.toString()
    );
    if (index > -1) {
        // const validationId = res.validations[index]._id;
        // Delete the validation
        res.validations.splice(index, 1);
    }
    // Save the availability document
    await res.save();
    return 200;
};
export default mongoose.model<IBoat, IBoatModel>("Boat", boatSchema);