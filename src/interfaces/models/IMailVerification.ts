import {ObjectId} from "mongodb";

export default interface IMailVerification {
    _id: ObjectId | string;
    code: string;
    user: ObjectId | string;
    active: boolean;
    expirationDate: Date;
    mail: string;

}