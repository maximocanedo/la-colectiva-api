import {IError} from "../../interfaces/responses/Error.interfaces";
import {MongoError} from "mongodb";
import {mongoErrorMiddleware} from "./MongoError.handler";
import mongoose from "mongoose";
import {mongooseErrorMiddleware} from "./MongooseError.handler";
import E from "../index";
import {JsonWebTokenError, NotBeforeError, TokenExpiredError} from "jsonwebtoken";
import {jwtMiddleware} from "./JsonWebTokenError.handler";
import ColError from "../../ext/error/ColError";

const defaultHandler = (err: Error, def: IError = E.InternalError): IError => {
    if(err instanceof ColError) {
        return err.simplify();
    } else if(err instanceof MongoError) {
        return mongoErrorMiddleware(err as MongoError);
    } else if(err instanceof mongoose.Error) {
        return mongooseErrorMiddleware(err as mongoose.Error);
    } else if(err instanceof JsonWebTokenError || err instanceof NotBeforeError || err instanceof TokenExpiredError) {
        return jwtMiddleware(err as Error);
    } else {
        console.error(err);
        return def;
    }
};

export default defaultHandler;