import {Schema} from "mongoose";

export default interface ICommentable {
    comments: Schema.Types.ObjectId[] | string[];
}