import {Schema} from "mongoose";

export default interface IMailVerification {
    _id: Schema.Types.ObjectId | string;
    code: string;
    user: Schema.Types.ObjectId | string;
    active: boolean;
    expirationDate: Date;
    mail: string;

}