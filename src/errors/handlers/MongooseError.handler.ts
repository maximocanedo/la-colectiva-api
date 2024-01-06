import {Error} from "mongoose";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../index";

export const mongooseErrorMiddleware = (err: Error): IError => {
    if(err instanceof Error.CastError)
        return E.InvalidInputFormatError;
    else if(
        err instanceof Error.DivergentArrayError ||
        err instanceof Error.MissingSchemaError ||
        err instanceof Error.MongooseServerSelectionError ||
        err instanceof Error.OverwriteModelError ||
        err instanceof Error.ParallelSaveError ||
        err instanceof Error.StrictPopulateError ||
        err instanceof Error.ValidatorError
    ) {
        console.error(err);
        return E.InternalError;
    } else if(err instanceof Error.DocumentNotFoundError)
        return E.ResourceNotFound;
    else if(err instanceof Error.StrictModeError)
        return E.InvalidInputFormatError;
    else if(err instanceof Error.ValidationError)
        return E.ValidationError;
    else return E.InternalError;

};