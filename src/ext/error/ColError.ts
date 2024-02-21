// Extend Error class
import {IError} from "../../interfaces/responses/Error.interfaces";

export default class ColError extends Error {
    public details: string | undefined;
    public code: string;
    constructor({ message, code, details }: IError) {
        super(message);
        this.details = details;
        this.code = code;
    }
    public isColError = (): boolean => true;
}
