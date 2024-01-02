import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export default interface IWaterBody {
    _id: ObjectId | string;
    name: string;
    user: ObjectId | string;
    type: number;
    uploadDate: Date;
    active: boolean;
    comments?: ObjectId[] | string[];
    validations?: IValidation[];

}