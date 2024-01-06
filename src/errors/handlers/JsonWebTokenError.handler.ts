import {JsonWebTokenError, NotBeforeError, TokenExpiredError} from "jsonwebtoken";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../index";
export const jwtMiddleware = (err: JsonWebTokenError | NotBeforeError | TokenExpiredError | Error): IError => {
    switch(err.name) {
        case "JsonWebTokenError":
            return E.InvalidToken;
        case "TokenExpiredError":
            return E.ExpiredToken;
        case "NotBeforeError":
            return E.UnsupportedToken;
        default:
            return E.AuthenticationError;
    }
}