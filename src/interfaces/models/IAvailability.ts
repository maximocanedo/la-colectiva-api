import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface IAvailability {
    _id: ObjectId | string,
    path: ObjectId | string;
    condition: string;
    available: boolean;
    user: ObjectId | string;
    uploadDate: Date | string | number;
    active: boolean;
    validations: IValidation[];
}