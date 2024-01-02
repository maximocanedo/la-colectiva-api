"use strict";
import mongoose, { Schema } from "mongoose";
import Comment from "./Comment";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import Photo from "./Photo";

const DOCK_PROPERTY_STATUS: any = {
    PRIVATE: 0,
    PUBLIC: 1,
    BUSINESS: 2,
};


const dockSchema: Schema = new Schema({
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
        type: ObjectId,
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
dockSchema.statics.comment = async function (resId, content, userId) {
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
        throw error;
    }
};
dockSchema.statics.listComments = async function ({
                                                      resId,
                                                      page,
                                                      itemsPerPage,
                                                  }) {
    try {
        const resource = await this.findById(resId)
            .select("comments")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    model: "User",
                    select: "name",
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
dockSchema.statics.getValidations = async function (wbId, userId) {
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
dockSchema.statics.validate = async function (resId, userId, validates) {
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
        const existingValidation = resource.validations.find((validation: IValidation): boolean => {
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
export default mongoose.model("Dock", dockSchema);