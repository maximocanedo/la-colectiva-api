import {
    CUIT,
    EnterpriseDocument,
    IEnterpriseCreateProps,
    IEnterpriseCreateResponse,
    IEnterpriseDeleteProps,
    IEnterpriseEditProps,
    IEnterpriseFindProps,
    IEnterpriseGetProps,
    IEnterpriseUpdatePhoneProps,
    IEnterpriseUpdateRequiredProps
} from "./defs";
import Enterprise, {IEnterpriseView} from "../../schemas/Enterprise";
import ColError from "../error/ColError";
import E from "../../errors";
import {ObjectId} from "mongodb";
import {Schema} from "mongoose";
import IUser from "../../interfaces/models/IUser";
import FetchResult from "../../interfaces/responses/FetchResult";
import {IError} from "../../interfaces/responses/Error.interfaces";

export const exists = async (cuit: CUIT): Promise<boolean> => {
    const file: EnterpriseDocument = await Enterprise.findOne({ cuit });
    return file !== null;
}
export const existsByOID = async (id: string | Schema.Types.ObjectId): Promise<boolean> =>  {
    const file: EnterpriseDocument = await Enterprise.findOne({ _id: id });
    return file !== null;
}
export const canCreate = (responsible: IUser) => {
    return responsible.role >= 2 && responsible.active;
};
export const canUpdate = (responsible: IUser, file: EnterpriseDocument): boolean =>  (<IUser>responsible).role === 3 || ((<IUser>responsible).role === 2 && file !== null && file.user === (<IUser>responsible)._id && (<IUser>responsible).active);
export const create = async ({ cuit, name, description, foundationDate, phones, responsible }: IEnterpriseCreateProps): Promise<IEnterpriseCreateResponse> => {
    const alreadyExists: boolean = await exists(cuit);
    if(alreadyExists) throw new ColError(E.DuplicationError);
    const user: string | ObjectId = responsible._id;
    if(!canCreate(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const file: EnterpriseDocument = await Enterprise.create({
        user,
        cuit,
        name,
        description,
        foundationDate,
        phones,
        history: [
            {
                content: "Creación del registro",
                user,
                time: Date.now()
            }
        ]
    });
    if(!file) throw new ColError(E.CRUDOperationError);
    const _id: string | Schema.Types.ObjectId = file._id;
    return { _id };
};
export const disable = async ({ id, responsible }: IEnterpriseDeleteProps): Promise<void> => {
    const file: EnterpriseDocument = await Enterprise.findOne({ _id: id, active: true }, { active: 1, history: 1, user: 1, _id: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = false;
    file.history.push({
        content: "Deshabilitación del recurso. ",
        time: Date.now(),
        user: responsible._id as string
    });
    await file.save();
    return;
};
export const enable = async ({ id, responsible }: IEnterpriseDeleteProps): Promise<void> => {
    const file: EnterpriseDocument = await Enterprise.findOne({ _id: id, active: false }, { active: 1, history: 1, _id: 1, user: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = true;
    file.history.push({
        content: "Habilitación del recurso. ",
        time: Date.now(),
        user: responsible._id as string
    });
    await file.save();
    return;
};
export const edit = async ({ id: _id, responsible, cuit, name, description, foundationDate}: IEnterpriseEditProps): Promise<void> => {
    const file: EnterpriseDocument = await Enterprise.findOne({ _id, active: true }, { _id: 1, active: 1, cuit: 1, name: 1, description: 1, foundationDate: 1, history: 1, user: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.UnauthorizedRecordModification);
    const reg = (content: string): number => file.history.push({ content, time: Date.now(), user: responsible._id as string });
    if(cuit !== undefined) {
        if(await exists(cuit)) throw new ColError(E.DuplicationError);
        else {
            file.cuit = cuit;
            reg("Cambio de CUIT. ");
        }
    }
    if(name) {
        file.name = name;
        reg("Cambio de nombre");
    }
    if(description) {
        file.description = description;
        reg("Cambio de descripción. ");
    }
    if(foundationDate !== undefined) {
        file.foundationDate = new Date(foundationDate);
        reg("Cambio de fecha de fundación. ");
    }
    if(cuit === undefined && name === undefined && description === undefined && foundationDate === undefined)
        throw new ColError(E.AtLeastOneFieldRequiredError);
    await file.save();
    return;
};
export const get = async ({ id: _id, responsible }: IEnterpriseGetProps): Promise<IEnterpriseView> => {
    const { data, error }: FetchResult<IEnterpriseView> = await Enterprise.listData(
        { _id, ...(responsible === undefined || responsible.role !== 3 ? { active: true } : {}) }
        , { page: 0, itemsPerPage: 1 });
    if(data.length === 0) throw new ColError(E.ResourceNotFound);
    if(error !== null && error !== undefined) throw new ColError(error as IError);
    return data[0];
};
export const find = async ({ q, paginator: { page, size: itemsPerPage } }: IEnterpriseFindProps): Promise<IEnterpriseView[]> => {
    const { data, error }: FetchResult<IEnterpriseView> = await Enterprise.listData({
            $and: [
                { active: true },
                {
                    $or: [
                        { name: { $regex: q, $options: "i" } },
                        { description: { $regex: q, $options: "i" } }
                    ]
                }
            ]
        }, { page, itemsPerPage });
    if(error !== undefined && error !== null) throw new ColError(error as IError);
    return [ ...data ];
};
export const addPhone = async ({ id, responsible, phone }: IEnterpriseUpdatePhoneProps): Promise<string[]> => {
    const file = await Enterprise.findOne({ _id: id, active: true }, { phones: 1, history: 1, user: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.UnauthorizedRecordModification);
    const { error, phones } = await file.addPhone(phone, responsible._id as string);
    if(error !== undefined && error !== null) throw new ColError(error as IError);
    return phones;
};
export const deletePhone = async ({ id, responsible, phone }: IEnterpriseUpdatePhoneProps): Promise<string[]> => {
    const file = await Enterprise.findOne({ _id: id, active: true }, { phones: 1, history: 1, user: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.UnauthorizedRecordModification);
    const { error, phones } = await file.deletePhone(phone, responsible._id as string);
    if(error !== undefined && error !== null) throw new ColError(error as IError);
    return phones;
};
export const listPhones = async (id: string | Schema.Types.ObjectId): Promise<string[]> => {
    const file = await Enterprise.findOne({ _id: id, active: true }, { phones: 1, history: 1, user: 1  });
    if(!file) throw new ColError(E.ResourceNotFound);
    return file.phones;
};