import {Document, Schema} from "mongoose";
import IUser from "../../interfaces/models/IUser";
import {ObjectId} from "mongodb";
import {IUserMethods} from "../../schemas/User";
import IMailVerification from "../../interfaces/models/IMailVerification";
export type IUserDocument = (Document<unknown, {}, IUser> & Omit<IUser & Required<{_id: string | ObjectId}>, keyof IUserMethods> & IUserMethods) | null;
export type IEmailVerificationDocument =  Document<unknown, {}, IMailVerification> & IMailVerification & Required<{_id: string | Schema.Types.ObjectId}>;
export interface IUserSignUpRequiredFields {
    username: string;
    name: string;
    email: string;
    bio: string;
    birth: Date;
    password: string;
}
export interface IUserEditParams {
    responsible: IUser;
    username: string;
    name?: string;
    bio?: string;
    birth?: Date;
}
export interface IUserDisableParams {
    responsible: IUser;
    username: string;
}
export interface IUserEnableParams {
    responsible: IUser;
    username: string;
}
export interface IUserFindParams {
    responsible?: IUser;
    username: string;
}
export interface IUserPasswordUpdateParams {
    responsible: IUser;
    password: string;
}
export type Role = 0 | 1 | 2 | 3;
export interface IUserRoleUpdateParams {
    responsible: IUser;
    username: string;
    role: Role;
}
export interface IStartMailVerificationParams {
    user: IUser | IUserDocument;
    email: string;
}
export type ExpirationDate = "15m" | "8h" | "24h" | "7d" | "14d";
export interface ILoginParams {
    email?: string;
    username?: string;
    password: string;
    exp?: ExpirationDate;
}
export interface ILoginResult {
    success: boolean;
    user: IUser | IUserDocument;
    token: string;
}