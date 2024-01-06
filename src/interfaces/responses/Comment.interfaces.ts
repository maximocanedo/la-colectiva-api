import IComment from "../models/IComment";
import {Schema} from "mongoose";

interface CommentBasicResponse {
    status: number,
    error?: any,
    msg: string
}

export interface CommentFetchResponse extends CommentBasicResponse {
    comments: IComment[] | Schema.Types.ObjectId[] | string[];
}
export interface CommentAddResponse extends CommentBasicResponse {
    comment: IComment[] | Schema.Types.ObjectId[] | string[] | IComment | Schema.Types.ObjectId | string;
}