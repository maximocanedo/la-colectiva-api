import {ObjectId} from "mongodb";

export default interface IPictureable {
    pictures: ObjectId[] | string[],
}