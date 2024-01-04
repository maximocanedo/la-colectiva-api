'use strict';

export interface IError {
    code: string;
    message: string;
    details?: string;
    uri?: string;
    errors?: any;
}