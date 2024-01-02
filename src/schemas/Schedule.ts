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
    comment(resId: string, content: string, userId: string): Promise<any>;
    listComments({
         resId,
         page,
         itemsPerPage,
     }: {
        resId: string;
        page: number;
        itemsPerPage: number;
    }): Promise<any>;
    getValidations(wbId: string, userId: string): Promise<any>;
    //validate(resId: string, userId: string, validates: boolean): Promise<any>;

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
scheduleSchema.statics.comment = async function (resId, content, userId) {
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
scheduleSchema.statics.listComments = async function ({
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

/* Validaciones */
scheduleSchema.statics.getValidations = async function (wbId, userId) {
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
scheduleSchema.statics.validate = async function (resId, userId, validates) {
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

export default mongoose.model<ISchedule, IScheduleModel>("Schedule", scheduleSchema);