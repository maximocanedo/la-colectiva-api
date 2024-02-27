import IUser from "./interfaces/models/IUser";
import {IPaginator} from "./endpoints/pre";

declare module 'express-serve-static-core' {
    export interface Request {
        paginator?: IPaginator,
        user?: IUser,
        file?: any
    }
}