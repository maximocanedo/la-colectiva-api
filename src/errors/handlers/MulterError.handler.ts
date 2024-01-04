import multer, {MulterError} from "multer";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../index";
import {TooMuchDataError} from "../V.errors";

export const multerErrorMiddleware = (err: MulterError): IError => {
        switch(err.code as multer.ErrorCode) {
            case "LIMIT_FILE_SIZE":
                return E.FileTooLarge
            case "LIMIT_UNEXPECTED_FILE":
                return E.InvalidFileType;
            case "LIMIT_PART_COUNT":
                return E.TooManyFiles;
            case "LIMIT_FILE_COUNT":
                return E.TooManyFiles;
            case "LIMIT_FIELD_KEY":
                return E.TooManyFiles;
            case "LIMIT_FIELD_VALUE":
                return E.TooMuchDataError;
            case "LIMIT_FIELD_COUNT":
                return E.TooMuchDataError;
            default:
                return E.UploadError;
        }
};