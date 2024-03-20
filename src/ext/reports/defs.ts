import {Schema} from "mongoose";
import {RecordCategory, ReportReason} from "../../schemas/Report";
import IUser from "../../interfaces/models/IUser";

export interface IReportCreateRequestedData {
    resource: Schema.Types.ObjectId | string;
    type: RecordCategory;
    reason: ReportReason;
    details: string;
    responsible: IUser;
}
export interface IReportCreateResponse {
    _id: string | Schema.Types.ObjectId;
}