import {
    BoatDocument,
    IBoatCreateRequiredProps,
    IBoatCreateResponse,
    IBoatEditRequest, IBoatEditResponse, IFindBoatRequest,
    ISensibleAction,
    OID
} from "./defs";
import IUser from "../../interfaces/models/IUser";
import ColError from "../error/ColError";
import E from "../../errors";
import * as enterprises from "../enterprises";
import Boat, {IBoatView} from "../../schemas/Boat";
import FetchResult from "../../interfaces/responses/FetchResult";
import {IPaginator} from "../../endpoints/pre";
export const canCreate = (responsible: IUser) => {
    return responsible.role >= 2 && responsible.active;
};
export const canUpdate = (responsible: IUser, file: BoatDocument): boolean =>  (<IUser>responsible).role === 3 || ((<IUser>responsible).role === 2 && file !== null && file.user === (<IUser>responsible)._id && (<IUser>responsible).active);
export const exists = async (id: OID): Promise<boolean> => {
    const file: BoatDocument = await Boat.findOne({ _id: id }, { _id: 1 });
    return file !== null;
};
export const existsByMat = async (mat: string): Promise<boolean> => {
    const file: BoatDocument = await Boat.findOne({ mat }, { _id: 1, mat: 1 });
    return file !== null;
};
export const create = async ({ responsible, mat, name, enterprise, status }: IBoatCreateRequiredProps)
    : Promise<IBoatCreateResponse> => {
    if(!canCreate) throw new ColError(E.AttemptedUnauthorizedOperation);
    if(!(await enterprises.existsByOID(enterprise))) throw new ColError(E.ResourceNotFound);
    if(await existsByMat(mat)) throw new ColError(E.DuplicationError);
    const file: BoatDocument = await Boat.create({ mat, name, enterprise, status, user: responsible._id as string,
        history: [{
            content: "Creación del registro. ",
            time: Date.now(),
            user: responsible._id as string
        }]
    });
    if(!file) throw new ColError(E.CRUDOperationError);
    return { _id: file._id };
};
export const disable = async ({ id: _id, responsible }: ISensibleAction): Promise<void> => {
    const file: BoatDocument = await Boat.findOne({ _id, active: true }, { history: 1, user: 1, active: 1, _id: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = false;
    file.history.push({ content: "Deshabilitación del recurso. ", time: Date.now(), user: responsible._id as string });
    await file.save();
    return;
};
export const enable = async ({ id: _id, responsible }: ISensibleAction): Promise<void> => {
    const file: BoatDocument = await Boat.findOne({ _id, active: false }, { history: 1, user: 1, active: 1, _id: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = true;
    file.history.push({ content: "Habilitación del recurso. ", time: Date.now(), user: responsible._id as string });
    await file.save();
    return;
};
export const edit = async ({ id: _id, responsible, mat, name, status, enterprise }: IBoatEditRequest): Promise<void> => {
    const file: BoatDocument = await Boat.findOne({ _id, active: true }, { mat: 1, name: 1, status: 1, enterprise: 1, history: 1, user: 1, active: 1, _id: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const t = (content: string): number => file.history.push({ content, time: Date.now(), user: responsible._id as string });
    if(mat !== undefined) {
        if(await existsByMat(mat)) throw new ColError(E.DuplicationError);
        file.mat = mat;
        t("Actualizar matrícula. ");
    }
    if(name !== undefined) {
        file.name = name;
        t("Actualizar nombre. ");
    }
    if(status !== undefined) {
        file.status = status;
        t("Actualizar estado de la embarcación. ");
    }
    if(enterprise !== undefined) {
        if(!(await enterprises.existsByOID(enterprise))) throw new ColError(E.ResourceNotFound);
        file.enterprise = enterprise;
        t("Actualizar empresa administradora de la embarcación. ");
    }
    if([mat, name, status, enterprise].every(x => x === undefined))
        throw new ColError(E.AtLeastOneFieldRequiredError);
    await file.save();
};

export const get = async (id: OID, responsible: IUser | undefined | null): Promise<IBoatView> => {
    const isAdmin: boolean = responsible !== undefined && responsible !== null && responsible.role === 3;
    const { data, error }: FetchResult<IBoatView> = await Boat.listData(
        { _id: id, ...(isAdmin ? {} : { active: true })  },
        { page: 0, size: 1 }
    );
    if (data.length === 0) throw new ColError(E.ResourceNotFound);
    if(!!error) throw new ColError(error);
    return data[0];
};

export const find = async ({ q, paginator, enterprise }: IFindBoatRequest): Promise<IBoatView[]> => {
    const { data, error }: FetchResult<IBoatView> = await Boat.listData({
        $and: [
            {
                $or: [
                    { name: { $regex: q || "", $options: "i" }, active: true },
                    { mat: { $regex: q || "", $options: "i" }, active: true },
                ]
            },
            ...(enterprise !== undefined ? [{ enterprise }] : [])
        ],
    }, paginator);
    if(!!error) throw new ColError(error);
    return data;
};