import {model, Model, Schema} from "mongoose";
import {AvailabilityCondition} from "./Availability";
import {string} from "joi";

export interface INextQueryArchive {
    clientIdentifier: string;
    user?: Schema.Types.ObjectId | string;
    from: Schema.Types.ObjectId | string;
    to: Schema.Types.ObjectId | string;
    date: Date | string;
    conditions: AvailabilityCondition[],
    hour: number;
    minute: number;
}
export interface INextQueryArchiveMethods {

}
export interface INextQueryArchiveModel extends Model<INextQueryArchive, {}, INextQueryArchiveMethods> {

}

const nextQueryArchive = new Schema<INextQueryArchive, INextQueryArchiveModel, INextQueryArchiveMethods>({
    clientIdentifier: {
        type: String,
        required: true
    },
    user: {
        sparse: true,
        type: Schema.Types.ObjectId
    },
    from: {
        type: Schema.Types.ObjectId,
        ref: "Dock",
        required: true
    },
    to: {
        type: Schema.Types.ObjectId,
        ref: "Dock",
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: () => new Date()
    },
    conditions: [{
        type: String,
        enum: Object.values(AvailabilityCondition)
    }],
    hour: {
        type: Number,
        required: true
    },
    minute: {
        type: Number,
        required: true
    }
});
const NextQueryArchive = model<INextQueryArchive, INextQueryArchiveModel>("NextQueryArchive", nextQueryArchive);
export const logNextQuery = async (
    clientIdentifier: string,
    from: Schema.Types.ObjectId | string,
    to: Schema.Types.ObjectId | string,
    conditions: AvailabilityCondition[],
    time: string,
    user?: string
): Promise<void> => {
    const [ hour, minute ]: number[] = time.split(":").map(x => parseInt(x));
    const file = await NextQueryArchive.create({
        clientIdentifier, from, to, conditions, hour, minute, ...(user === undefined ? {} : { user })
    });
    return;
}
export default NextQueryArchive;