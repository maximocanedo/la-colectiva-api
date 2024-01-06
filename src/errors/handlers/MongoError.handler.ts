import {MongoError} from "mongodb";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../index";

export const mongoErrorMiddleware = (err: MongoError): IError => {
    switch(err.code) {
        case 47:
            return E.ResourceNotFound;
        case 68:
            return E.DuplicationError;
        case 10334:
            return E.TooMuchDataError;
        case 11000:
            return E.DuplicationError;
        default:
            console.error(err);
            return E.InternalError;
    }
};