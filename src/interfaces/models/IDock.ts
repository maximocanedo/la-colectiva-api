import {ObjectId} from "mongodb";
import IValidation from "./IValidation";

export type DockPropertyStatus = 0 | 1 | 2;
export default interface IDock {
    _id: ObjectId | string,
    name: string,
    address: number,
    region: ObjectId | string,
    notes: string,
    status: DockPropertyStatus,
    user: ObjectId | string,
    uploadDate: Date | string | number,
    active: boolean,
    comments?: ObjectId[] | string[],
    validations: IValidation[],
    coordinates: number[],
    pictures?: ObjectId[] | string[],
}