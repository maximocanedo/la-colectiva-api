"use strict";
import mongoose, {Model, Schema} from "mongoose";
import {ObjectId} from "mongodb";
import moment from "moment-timezone";
import IComment from "../interfaces/models/IComment";

const localDate = moment.tz(Date.now(), "America/Argentina/Buenos_Aires");

interface ICommentModel extends Model<IComment> {
    add(userId: ObjectId, content: string): Promise<IComment>;
    delete(commentId: ObjectId): Promise<CommentDeleteResponse>;
}

const CommentSchema: Schema<IComment, ICommentModel> = new Schema<IComment, ICommentModel>({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    content: {
        type: String,
        required: true,
        maxlength: 256,
        minlength: 1,
    },
    uploadDate: {
        type: Date,
        required: true,
        default: () => moment.tz(Date.now(), "America/Argentina/Buenos_Aires").toDate(),
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
});
CommentSchema.statics.add = async function (userId, content): Promise<IComment> {
    try {
        return await this.create({
            user: userId,
            content: content,
            uploadDate: moment.tz(Date.now(), "America/Argentina/Buenos_Aires")
        });
    } catch (error) {
        throw error;
    }
};
interface CommentDeleteResponse {
    success: boolean,
    status: number,
    message: string
}
CommentSchema.statics.delete = async function (commentId): Promise<CommentDeleteResponse> {
    try {
        const comment = await this.findById(commentId);
        if (!comment) {
            return {
                success: false,
                status: 404,
                message: "Comment not found",
            };
        }
        comment.active = false;
        await comment.save();

        return {
            success: true,
            status: 200,
            message: "Comment deleted",
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            status: 500,
            message: "Could not delete comment",
        };
    }
};

export default mongoose.model<IComment, ICommentModel>("Comment", CommentSchema);