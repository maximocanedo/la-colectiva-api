"use strict";
import mongoose, {Model, Schema} from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import {
    IEnterpriseAddPhoneResponse, IEnterpriseCommentAddedResponse,
    IEnterpriseGetValidationsResponse, IEnterpriseListCommentsResponse
} from "../interfaces/responses/Enterprise.interfaces";
import {IActionPerformedCommonResponse} from "../interfaces/responses/Default.interfaces";
import IEnterprise from "../interfaces/models/IEnterprise";

interface IEnterpriseMethods {
    addPhone(phoneNumber: string): Promise<IEnterpriseAddPhoneResponse>;
    deletePhone(phoneNumber: string): Promise<IEnterpriseAddPhoneResponse>;
}
interface IEnterpriseModel extends Model<IEnterprise, {}, IEnterpriseMethods> {
    comment(resId: string, content: string, userId: string): Promise<IEnterpriseCommentAddedResponse>;
    listComments({resId, page, itemsPerPage}: {resId: string, page: number, itemsPerPage: number}): Promise<IEnterpriseListCommentsResponse>;
    getValidations(wbId: string, userId: string): Promise<IEnterpriseGetValidationsResponse>;
    //validate(resId: string, userId: string, validates: boolean): Promise<IActionPerformedCommonResponse>;


}

const enterpriseSchema: Schema<IEnterprise, IEnterpriseModel, IEnterpriseMethods> = new Schema<IEnterprise, IEnterpriseModel, IEnterpriseMethods>({
    cuit: {
        type: Number,
        required: true,
        unique: true,
        // Validar
    },
    name: {
        type: String,
        maxlength: 48,
        minlength: 3,
        required: true,
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
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    foundationDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    phones: [
        {
            type: String,
            minlength: 3,
            maxlength: 24,
        },
    ],
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


enterpriseSchema.statics.comment = async function (resId, content, userId): Promise<IEnterpriseCommentAddedResponse> {
    try {
        // Crear el comentario y guardarlo
        const newComment = await Comment.create({
            user: userId,
            content: content,
        });
        await this.updateOne(
            { _id: resId },
            { $push: { comments: newComment._id } }
        );

        return {
            newComment,
            status: 201,
        };
    } catch (error) {
        return {
            newComment: null,
            status: 500,
            error,
        };
    }
};
enterpriseSchema.statics.listComments = async function ({resId, page, itemsPerPage }): Promise<IEnterpriseListCommentsResponse> {
    try {
        const resource = await this.findById(resId)
            .select("comments")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    model: "User",
                    select: "name", // Cambia "name" a "fullName" si ese es el campo de nombre completo en tu modelo de usuario
                },
                options: {
                    sort: { uploadDate: 1 },
                    skip: page * itemsPerPage,
                    limit: itemsPerPage,
                },
            })
            .exec();

        if (!resource) {
            return {
                comments: [],
                status: 404,
                error: null,
                msg: "Resource not found.",
            };
        }

        return {
            comments: resource.comments,
            status: 200,
            error: null,
            msg: "",
        };
    } catch (err) {
        return {
            comments: [],
            status: 500,
            error: err,
            msg: "Could not fetch the comments.",
        };
    }
};


enterpriseSchema.methods.addPhone = async function (phoneNumber: string): Promise<IEnterpriseAddPhoneResponse> {
    try {
        this.phones.push(phoneNumber);
        await this.save();
        return {
            phones: this.phones,
            status: 200,
            msg: "Phone number added successfully.",
        };
    } catch (error) {
        return {
            phones: [],
            status: 500,
            error: error,
            msg: "Failed to add phone number.",
        };
    }
};
enterpriseSchema.methods.deletePhone = async function (phoneNumber: string): Promise<IEnterpriseAddPhoneResponse> {
    try {
        this.phones = this.phones.filter((phone: string): boolean => phone !== phoneNumber);
        await this.save();
        return {
            phones: this.phones,
            status: 200,
            msg: "Phone number deleted successfully.",
        };
    } catch (error) {
        return {
            phones: this.phones,
            status: 500,
            error: error,
            msg: "Failed to delete phone number.",
        };
    }
};


enterpriseSchema.statics.getValidations = async function (wbId, userId): Promise<IEnterpriseGetValidationsResponse> {
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
enterpriseSchema.statics.validate = async function (resId, userId, validates): Promise<IActionPerformedCommonResponse> {
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

export default mongoose.model<IEnterprise, IEnterpriseModel>("Enterprise", enterpriseSchema);