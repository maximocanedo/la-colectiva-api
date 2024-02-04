'use strict';

import {IError} from "./Error.interfaces";

export default interface FetchResult<T> {
    status: number,
    data: T[],
    error?: IError | null
}