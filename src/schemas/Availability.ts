"use strict";
import { Schema, Types, model } from "mongoose";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import {IAvailabilityResponseSample} from "../interfaces/responses/Availability.interfaces";

// TODO: Agregar endpoint para verificar si un horario está disponible en X condiciones / Condiciones del horario en cuestión.
/*const conditionOptions: string[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
    "HOLIDAY",
    "HIGH_TIDE",
    "LOW_TIDE",
];

const requiredP: string[] = ["path", "condition", "available"]; */

const AvailabilitySchema: Schema = new Schema({
    path: {
        type: ObjectId,
        required: true,
        ref: "Path",
    },
    condition: {
        type: String,
        required: true,
        ref: "Path",
        minlength: 3,
        maxlength: 24,
    },
    available: {
        type: Boolean,
        required: true,
        default: true,
    },
    user: {
        type: ObjectId,
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
    validations: [ValidationSchema],
});

/**
 * Método para obtener las validaciones de un recurso.
 * @param wbId ID del recurso del que se desean obtener las validaciones.
 * @param userId ID del usuario. Sirve para saber si emitió una validación o no.
 */
AvailabilitySchema.statics.getValidations = async function (wbId: string, userId: string): Promise<IAvailabilityResponseSample> {
    try {
        const aggregationResult = await this.aggregate([
            { $match: { _id: new Types.ObjectId(wbId) } },
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
                                cond: {
                                    $eq: ["$$validation.validation", true],
                                },
                            },
                        },
                    },
                    againstCount: {
                        $size: {
                            $filter: {
                                input: "$validations",
                                as: "validation",
                                cond: {
                                    $eq: ["$$validation.validation", false],
                                },
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
                                            new Types.ObjectId(userId),
                                        ],
                                    },
                                    -1,
                                ],
                            },
                            then: {
                                $cond: {
                                    if: {
                                        $eq: ["$validations.validation", true],
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
 * @param resId ID del recurso que se desea validar.
 * @param userId ID del usuario que desea validar el recurso.
 * @param validates Booleano que indica si el usuario está a favor o en contra del recurso.
 */
AvailabilitySchema.statics.validate = async function (
    resId: string,
    userId: string,
    validates: boolean
): Promise<IAvailabilityResponseSample> {
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
        const existingValidation = resource.validations.find((validation: any) => {
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
 * Método para eliminar una validación.
 * @param userId ID del usuario que desea eliminar su validación.
 * @param resId ID del recurso al que se le desea eliminar la validación.
 */
AvailabilitySchema.statics.deleteValidation = async function (userId: string, resId: string): Promise<number> {
    const res = await this.findById(resId);
    if (!res) return 404;
    // Remove the validation from the validations array in the availability document
    const index = res.validations.findIndex(
        (item: IValidation): boolean => item.user.toString() === userId.toString()
    );
    if (index > -1) {
        //const validationId = res.validations[index]._id;
        // Delete the validation
        res.validations.splice(index, 1);
    }
    // Save the availability document
    await res.save();
    return 200;
};
const Availability = model("Availability", AvailabilitySchema);
export default Availability;