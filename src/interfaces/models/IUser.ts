import {ObjectId} from "mongodb";

export default interface IUser {
    _id: ObjectId | string,
    username: string;
    name: string;
    email: string;
    bio: string;
    birth: Date;
    role: number;
    password: string;
    active: boolean;
}