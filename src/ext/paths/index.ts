import Path, {IPathView} from "../../schemas/Path";
import {
    AvailabilityDocument,
    IPathAvailabilityCreateRequest, IPathAvailabilityCreateResponse,
    IPathCreateRequest,
    IPathCreateResponse,
    IPathEditRequest,
    IPathGetRequest, IPathListRequest,
    ISensibleAction,
    PathDocument
} from "./defs";
import IUser from "../../interfaces/models/IUser";
import ColError from "../error/ColError";
import E from "../../errors";
import * as boats from "./../boats";
import FetchResult from "../../interfaces/responses/FetchResult";
import {OID} from "../boats/defs";
import Availability from "../../schemas/Availability";
export const canCreate = (responsible: IUser) => {
    return responsible.role >= 2 && responsible.active;
};
export const canAddAvailabilities = (responsible: IUser): boolean => {
    return  responsible.active && (responsible.role === 3 || responsible.role === 2);
}
export const canUpdate = (responsible: IUser, file: PathDocument): boolean =>  (<IUser>responsible).role === 3 || ((<IUser>responsible).role === 2 && file !== null && file.user === (<IUser>responsible)._id && (<IUser>responsible).active);
export const canUpdateAvailability = (responsible: IUser, file: AvailabilityDocument): boolean =>  (<IUser>responsible).role === 3 || ((<IUser>responsible).role === 2 && file !== null && file.user === (<IUser>responsible)._id && (<IUser>responsible).active);

export const exists = async (id: OID | string): Promise<boolean> => {
    const file: PathDocument = await Path.findOne({ _id: id, active: true });
    return file !== null;
}
export const create = async ({ boat, title, description, notes, responsible }: IPathCreateRequest): Promise<IPathCreateResponse> => {
    if(!canCreate(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const boatExists: boolean = await boats.exists(boat);
    if(!boatExists) throw new ColError(E.ResourceNotFound);
    const file = await Path.create({
        boat, title, description, notes, user: responsible._id as string,
        history: [
            {
                content: "Creación del documento. ",
                user: responsible._id as string,
                time: Date.now()
            }
        ]
    });
    if(!file) throw new ColError(E.CRUDOperationError);
    return { _id: file._id };
};
export const disable = async ({ id: _id, responsible }: ISensibleAction): Promise<void> => {
    const file: PathDocument = await Path.findOne({ _id, active: true }, { _id: 1, user: 1, active: 1, history: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = false;
    file.history.push({ content: "Deshabilitar registro. ", time: Date.now(), user: responsible._id as string });
    await file.save();
    return;
};
export const enable = async ({ id: _id, responsible }: ISensibleAction): Promise<void> => {
    const file: PathDocument = await Path.findOne({ _id, active: false }, { _id: 1, user: 1, active: 1, history: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = true;
    file.history.push({ content: "Deshabilitar registro. ", time: Date.now(), user: responsible._id as string });
    await file.save();
    return;
};
export const edit = async ({ id: _id, responsible, boat, title, description, notes }: IPathEditRequest): Promise<void> => {
    const file: PathDocument = await Path.findOne({ _id, active: true }, { _id: 1, user: 1, history: 1, boat: 1, title: 1, description: 1, notes: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const reg = (content: string) => file.history.push({ content, time: Date.now(), user: responsible._id as string });
    if(boat !== undefined) {
        if(!(await boats.exists(boat))) throw new ColError(E.ResourceNotFound);
        file.boat = boat;
        reg("Actualizar barco. ");
    }
    if(title !== undefined) {
        file.title = title;
        reg("Actualizar título. ");
    }
    if(description !== undefined) {
        file.description = description;
        reg("Actualizar descripción. ");
    }
    if(notes !== undefined) {
        file.notes = notes;
        reg("Actualizar notas. ");
    }
    if([boat, title, description, notes].every((x: any): boolean => x === undefined)) {
        throw new ColError(E.AtLeastOneFieldRequiredError);
    }
    await file.save();
    return;
};
export const get = async ({ id: _id, responsible }: IPathGetRequest): Promise<IPathView> => {
    const isAdmin: boolean = responsible !== null && responsible !== undefined && responsible.role === 3;
    const { data, error }: FetchResult<IPathView> = await Path.listData({
        _id, ...(isAdmin ? {} : { active: true })
    }, { page: 0, size: 1 });
    if(error) throw new ColError(E.CRUDOperationError);
    if(data.length === 0) throw new ColError(E.ResourceNotFound);
    return data[0];
};
export const list = async ({ q, paginator: { page, size } }: IPathListRequest): Promise<IPathView[]> => {
    const query = {
        $and: [
            { active: true },
            {
                $or: [
                    { title: { $regex: q, $options: "i" } },
                    { description: { $regex: q, $options: "i"} },
                    { notes: { $regex: q, $options: "i" } }
                ]
            }
        ]
    };
    const { data, error }: FetchResult<IPathView> = await Path.listData(query, { page, size });
    if(error) throw new ColError(E.CRUDOperationError);
    return data;
};

export const addAvailability = async ({id, available, responsible, condition}: IPathAvailabilityCreateRequest): Promise<IPathAvailabilityCreateResponse> => {
    if(!(await exists(id))) throw new ColError(E.ResourceNotFound);
    if(!canAddAvailabilities(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const file: AvailabilityDocument = await Availability.create({
        path: id, condition, available, user: responsible._id as string,
        history: [{ content: "Crear disponibilidad. ", user: responsible._id as string, time: Date.now() }]
    });
    if(!file) throw new ColError(E.CRUDOperationError);
    return {
        _id: file._id
    };
};
export const deleteAvailability = async (id: OID | string, responsible: IUser): Promise<void> => {
    const file: AvailabilityDocument = await Availability.findOne({ _id: id, active: true }, { _id: 1, active: 1, history: 1, user: 1, path: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdateAvailability(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = false;
    file.history.push({ content: "Deshabilitación del recurso. ", time: Date.now(), user: responsible._id as string });
    await file.save();
};