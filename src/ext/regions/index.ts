import {
    GetRegionResult,
    ICreateRegionProps,
    ICreateRegionResponse, IEditableRegion,
    IFindRegionsProps,
    IGetRegionProps,
    IRegionDocument, IUpdateRegionProps
} from "./defs";
import WaterBody, {IRegionView} from "../../schemas/WaterBody";
import IUser from "../../interfaces/models/IUser";
import ColError from "../error/ColError";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
import {Schema} from "mongoose";
import {IHistoryEvent} from "../../schemas/HistoryEvent";
import {OID} from "../boats/defs";

const canCreate = (responsible: IUser): boolean => {
    return responsible.role >= 2;
}
export const exists = async (id: OID, lookForDisabled: boolean): Promise<boolean> => {
    const file = await WaterBody.findOne({ _id: id, ...(lookForDisabled ? {} : { active: true }) });
    return file !== null;
}
export const create = async ({ name, type, responsible }: ICreateRegionProps): Promise<ICreateRegionResponse> => {
    if(!canCreate(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const { _id }: IRegionDocument = await WaterBody.create({
        user: responsible._id,
        name,
        type,
        history: [
            {
                content: "Creación del registro. ",
                time: Date.now(),
                user: responsible._id
            }
        ]
    });
    return { _id };
};
export const get = async ({ id, responsible }: IGetRegionProps): Promise<GetRegionResult> => {
    const isAdmin: boolean = responsible !== undefined && responsible.role === 3;
    const { status, ...result }: FetchResult<IRegionView> = await WaterBody.listData({
        _id: id,
        ...(isAdmin ? {} : { active: true })
    }, { page: 0, itemsPerPage: 1 });
    if(result.data.length === 0) throw new ColError(E.ResourceNotFound);
    return result;
};
export const find = async ({ q, paginator: { page, size } }: IFindRegionsProps): Promise<FetchResult<IRegionView>> => {
    return await WaterBody.listData({
        active: true,
        name: { $regex: q, $options: "i" }
    }, { page, itemsPerPage: size });
};
const canEdit = (responsible: IUser, author: Schema.Types.ObjectId | string): boolean => {
    if(responsible.username === author) {
        return responsible.role >= 2;
    } else return responsible.role === 3;
};
export const del = async ({ id, responsible }: IUpdateRegionProps): Promise<void> => {
    const resource: IRegionDocument | null = await WaterBody.findById(id);
    if(resource === null) throw new ColError(E.ResourceNotFound);
    const canDelete: boolean = canEdit(responsible, resource.user);
    if(!canDelete) throw new ColError(E.AttemptedUnauthorizedOperation);
    resource.active = false;
    resource.history.push({
        content: "Deshabilitación del registro. ",
        time: Date.now(),
        user: responsible._id as string
    });
    await resource.save();
};
export const edit = async ({ responsible, id }: IUpdateRegionProps, { name, type }: IEditableRegion): Promise<void> => {
    if(name === undefined && type === undefined) throw new ColError(E.AtLeastOneFieldRequiredError);
    const resource: IRegionDocument | null = await WaterBody.findOne({ _id: id, active: 1 }, { user: 1, history: 1, name: 1, type: 1 });
    if(resource === null) throw new ColError(E.ResourceNotFound);
    if(!canEdit(responsible, resource.user)) throw new ColError(E.UnauthorizedRecordModification);
    const meta: Omit<IHistoryEvent, "content"> = { time: Date.now(), user: responsible._id as string };
    const notify = (content: string) => resource.history.push({ content, ...meta });
    if(name !== undefined) {
        resource.name = name;
        notify(`Cambio de nombre a "${name}". `);
    }
    if(type !== undefined) {
        resource.type = type;
        notify(`Cambio de tipo a "${type}". `);
    }
    await resource.save();
};