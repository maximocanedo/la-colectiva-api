import {IError} from "../../interfaces/responses/Error.interfaces";
import {MongoError} from "mongodb";
import {mongoErrorMiddleware} from "./MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "./MongooseError.handler";
import E from "../index";

const defaultHandler = (err: Error, def: IError | null = null ): IError | null => {
    if(err instanceof MongoError) {
        return mongoErrorMiddleware(err as MongoError);
    } else if(err instanceof mongoose.Error) {
        return mongooseErrorMiddleware(err as mongoose.Error);
    } else {
        return def;
    }
};

export default defaultHandler;