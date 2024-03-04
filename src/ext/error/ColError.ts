// Extend Error class
import {HttpStatusCode, IError} from "../../interfaces/responses/Error.interfaces";

export default class ColError extends Error {
    public details: string | undefined;
    public code: string;
    public http: HttpStatusCode;
    constructor({ message, code, details, http }: IError) {
        super(message);
        this.details = details;
        this.code = code;
        this.http = http?? 500;
    }
    public isColError = (): boolean => true;
    public simplify = (): IError => ({
        message: this.message,
        code: this.code,
        details: this.details,
        http: this.http
    });
}
