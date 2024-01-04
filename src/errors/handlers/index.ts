'use strict';
import * as MulterErrorHandlers from './MulterError.handler';
import * as JWTErrorHandlers from "./JsonWebTokenError.handler"
export const handlers = {
    ...MulterErrorHandlers,
    ...JWTErrorHandlers
};