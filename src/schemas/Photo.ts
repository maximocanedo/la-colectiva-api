"use strict";
import fs from "fs";
import path from "path";
import mongoose, {Model, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import Comment from "./Comment";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import IPicture from "../interfaces/models/IPicture";
import dotenv from "dotenv";
dotenv.config();


interface IPictureModel extends Model<IPicture> {
    saveUploaded: (file: any, user: any, description: any) => Promise<any>;
    getPhotoDetailsById: (id: any) => Promise<PhotoDetailsResponse | PhotoDetailsResponseError>;
    comment: (photoId: any, content: any, userId: any) => Promise<any>;
    listComments: (params: any) => Promise<any>;
    getValidations: (wbId: any, userId: any) => Promise<GetValidationsResponse>;
    //validate: (photoId: string, userId: string, validates: boolean) => Promise<ActionPerformedResponse>;
    deletePhotoById: (id: any) => Promise<ActionPerformedResponse>;

}

const photoSchema: Schema<IPicture, IPictureModel> = new Schema<IPicture, IPictureModel>({
    filename: {
        type: String,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
        required: false,
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
    validations: [ValidationSchema],
});

// Guardar foto en la base de datos.
photoSchema.statics.saveUploaded = async function (file, user, description): Promise<any> {
    console.log({ file, user, description });
    try {
        let pic = new this({
            filename: file.filename,
            user,
            description,
        });

        let pics = await pic.save();
        return pics._id;
    } catch (err) {
        console.log(err);
    }
};

interface PhotoDetailsResponse {
    url: string,
    user: string | Schema.Types.ObjectId,
    description?: string,
    uploadDate: Date | string | number
    validations?: number,
    invalidations?: number
}
interface PhotoDetailsResponseError {
    error: any
}

// Obtener detalles de la foto por su ID.
photoSchema.statics.getPhotoDetailsById = async function (id): Promise<PhotoDetailsResponse | PhotoDetailsResponseError> {
    try {
        const pic = await this.findOne({ _id: id, active: true });
        if (!pic) return { error: "Photo not found" };
        const totalValidations = pic.validations.filter(
            (validation: IValidation): boolean => validation.validation
        ).length;
        const totalInvalidations = pic.validations.filter(
            (validation: IValidation): boolean => !validation.validation
        ).length;
        return {
            url: `/photos/${id}/view`,
            user: pic.user,
            description: pic.description,
            uploadDate: pic.uploadDate,
            validations: totalValidations,
            invalidations: totalInvalidations,
        };
    } catch (err) {
        console.error(err);
        return {error: err };
    }
};

photoSchema.statics.comment = async function (photoId, content, userId) {
    try {
        // Crear el comentario y guardarlo
        const newComment = await Comment.create({
            user: userId,
            content: content,
        });

        // Agregar el ObjectId del comentario al arreglo de comentarios de la foto
        await this.updateOne(
            { _id: photoId },
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
photoSchema.statics.listComments = async function ({
                                                       photoId,
                                                       page,
                                                       itemsPerPage,
                                                   }) {
    try {
        const photo = await this.findById(photoId)
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

        if (!photo) {
            return {
                comments: [],
                status: 404,
                error: null,
                msg: "Photo not found.",
            };
        }

        return {
            comments: photo.comments,
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
interface ActionPerformedResponse {
    success: boolean,
    status: number,
    message: string,
    error?: any
}
interface GetValidationsResponse extends ActionPerformedResponse {
    inFavorCount?: number,
    againstCount?: number,
    userVote?: boolean | null
}
photoSchema.statics.getValidations = async function (wbId, userId): Promise<GetValidationsResponse> {
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

photoSchema.statics.validate =
    async function
    (photoId: string, userId: string, validates: boolean): Promise<ActionPerformedResponse> {
    try {
        const photo = await this.findById(photoId);
        if (!photo) {
            return {
                success: false,
                status: 404,
                message: "Photo not found",
            };
        }

        // Buscar si el usuario ya tiene una validación en esta foto
        const existingValidation = photo.validations.find((validation: IValidation): boolean => {
            return validation.user.toString() === userId.toString();
        });

        if (existingValidation) {
            // Si ya existe una validación, actualizar su estado
            existingValidation.validation = validates;
        } else {
            // Si no existe, crear una nueva validación
            photo.validations.push({
                user: userId,
                validation: validates,
            });
        }

        await photo.save();

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

photoSchema.statics.deletePhotoById = async function (id): Promise<ActionPerformedResponse> {
    try {
        const photo = await this.findById(id);

        if (!photo) {
            return {
                success: false,
                status: 404,
                message: "Photo not found",
            };
        }

        // Eliminar el archivo del sistema
        const filePath: string = path.join(
            __dirname,
            ".." + process.env.PIC_ROOT_FOLDER,
            photo.filename
        );
        fs.unlink(filePath, (err: NodeJS.ErrnoException | null): void => {
            if (err) {
                console.error(err);
            }
        });

        // Eliminar el registro en la base de datos
        await this.deleteOne({ _id: id });

        return {
            success: true,
            status: 200,
            message: "Photo deleted successfully",
        };
    } catch (error) {
        return {
            success: false,
            status: 500,
            message: "Could not delete photo",
        };
    }
};
export default mongoose.model<IPicture, IPictureModel>("Photo", photoSchema);