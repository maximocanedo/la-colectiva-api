import {IReportCreateRequestedData, IReportCreateResponse} from "./defs";
import Report, {IReport, IReportView, RecordCategory, ReportReason, ReportStatus} from "../../schemas/Report";
import ColError from "../error/ColError";
import E from "../../errors";
import {IPaginator} from "../../endpoints/pre";
import {FilterQuery, Schema} from "mongoose";
import IUser from "../../interfaces/models/IUser";
import {ObjectId} from "mongodb";

export const report = async ({ reason, type, details, resource, responsible }: IReportCreateRequestedData): Promise<IReportCreateResponse> => {
    const data = await Report.create({
        reason, type, details, resource, user: responsible._id
    });
    if(!data) throw new ColError(E.CRUDOperationError);
    return { _id: data._id };
};
const getReports = async (query: FilterQuery<IReport>, {page, size}: IPaginator, responsible: IUser): Promise<IReportView[]> => {
    const isAdmin: boolean = responsible.role === 3;
    const files = await Report.find(
        { ...query, ...(isAdmin ? {} : { user: responsible._id })}
    )
        .populate("user", "_id name username role")
        .populate("admin", "_id name username role")
        .sort({uploadDate: -1})
        .skip(page * size)
        .limit(size);
    if(!files) throw new ColError(E.CRUDOperationError);
    return [...(files as unknown as IReportView[])];
};
export const get = async (q: string, paginator: IPaginator, responsible: IUser, type?: RecordCategory, reason?: ReportReason, status?: ReportStatus): Promise<IReportView[]> => {
    console.log({q});
    const isOID: boolean = ObjectId.isValid(q);
    return await getReports({
        $or: [
            ...(isOID ? [{ _id: { $oid: q} }] : []),
            ...(isOID ? [{ resource: { $oid: q} }] : []),
            {
                $and: [
                    {
                        $or: [
                            { details: { $regex: q || "", $options: "i" } },
                            { officialMessage: { $regex: q || "", $options: "i" } }
                        ]
                    },
                    ...[type !== undefined ? { type } : {}],
                    ...[reason !== undefined ? { reason }: {}],
                    ...[status !== undefined ? { status }: {}]

                ]
            }

        ]
    }, paginator, responsible);
};
export const patch = async (id: Schema.Types.ObjectId | string, responsible: IUser, status?: ReportStatus, officialMessage?: string): Promise<void> => {
    const isAdmin: boolean = responsible.role === 3;
    if(!isAdmin) throw new ColError(E.AttemptedUnauthorizedOperation);
    const file = await Report.findOne({ _id: id });
    if(!file) throw new ColError(E.ResourceNotFound);
    file.admin = responsible._id as string;
    if(status !== undefined) file.status = status;
    if(officialMessage !== undefined) file.officialMessage = officialMessage;
    const d = await file.save();
    return;
};