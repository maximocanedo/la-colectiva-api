'use strict';
import * as MulterErrorHandlers from './MulterError.handler';
import * as JWTErrorHandlers from "./JsonWebTokenError.handler";
import * as MongoErrorHandlers from "./MongoError.handler";
import * as MongooseErrorHandlers from "./MongooseError.handler";
export const handlers = {
    ...MulterErrorHandlers,
    ...JWTErrorHandlers,
    ...MongoErrorHandlers,
    ...MongooseErrorHandlers
};