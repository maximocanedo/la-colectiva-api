import Dock, {IDockView} from "../../schemas/Dock";
import IDock from "../../interfaces/models/IDock";
import IUser from "../../interfaces/models/IUser";
import {BoatDocument, OID} from "../boats/defs";
import ColError from "../error/ColError";
import E from "../../errors";
import {
    DockDocument,
    IDockCreateRequest,
    IDockCreateResponse,
    IDockEditRequest,
    IDockExploreRequest, IDockFindRequest,
    ISensibleAction
} from "./defs";
import * as regions from "./../regions";
import Boat from "../../schemas/Boat";
import {FilterQuery} from "mongoose";
import FetchResult from "../../interfaces/responses/FetchResult";
import {coordinates} from "../../validators/dock.v";
export const canCreate = (responsible: IUser) => {
    return responsible.role >= 2 && responsible.active;
};
export const canUpdate = (responsible: IUser, file: DockDocument): boolean =>  (<IUser>responsible).role === 3 || ((<IUser>responsible).role === 2 && file !== null && file.user === (<IUser>responsible)._id && (<IUser>responsible).active);
export const existsByAddress = async (region: OID, address: number): Promise<boolean> => {
    const file: DockDocument = await Dock.findOne({ region, address }, { region: 1, address: 1 });
    return file !== null;
}
export const create = async ({ responsible, region, address, name, status, coordinates, notes }: IDockCreateRequest): Promise<IDockCreateResponse> => {
    if(!canCreate(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const regionExists: boolean = await regions.exists(region, false);
    if(!regionExists) throw new ColError(E.ResourceNotFound);
    const addressExists: boolean = await existsByAddress(region, address);
    if(addressExists) throw new ColError(E.DuplicationError);
    const file = await Dock.create({
        name, address, region, status, coordinates, notes, user: responsible._id as string,
        history: [{
            content: "Crear documento. ",
            time: Date.now(),
            user: responsible._id as string
        }]
    });
    if(!file) throw new ColError(E.CRUDOperationError);
    return { _id: file._id as string };
};
export const disable = async ({ id: _id, responsible }: ISensibleAction): Promise<void> => {
    const file: DockDocument = await Dock.findOne({ _id, active: true }, { user: 1, history: 1, active: 1, _id: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = false;
    file.history.push({ content: "Deshabilitación del recurso. ", time: Date.now(), user: responsible._id as string });
    await file.save();
    return;
};
export const enable = async ({ id: _id, responsible }: ISensibleAction): Promise<void> => {
    const file: DockDocument = await Dock.findOne({ _id, active: false }, { user: 1, history: 1, active: 1, _id: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    file.active = true;
    file.history.push({ content: "Habilitación del recurso. ", time: Date.now(), user: responsible._id as string });
    await file.save();
    return;
};
export const edit = async ({ name, address, region, status, coordinates, notes, id: _id, responsible }: IDockEditRequest): Promise<void> => {
    const file: DockDocument = await Dock.findOne({ _id, active: true }, { name: 1, address: 1, region: 1, status: 1, coordinates: 1, notes: 1, _id: 1, user: 1, history: 1, active: 1 });
    if(!file) throw new ColError(E.ResourceNotFound);
    if(!canUpdate(responsible, file)) throw new ColError(E.AttemptedUnauthorizedOperation);
    let hasAddressChanged: boolean = false;
    const reg = (content: string): number => file.history.push({ content, time: Date.now(), user: responsible._id as string });
    if(name !== undefined) {
        file.name = name;
        reg("Cambio de nombre. ");
    }
    if(address !== undefined) {
        file.address = address;
        hasAddressChanged = true;
        reg("Cambio de dirección. ");
    }
    if(region !== undefined) {
        if(!(await regions.exists(region, false))) throw new ColError(E.ResourceNotFound);
        file.region = region as string;
        hasAddressChanged = true;
        reg("Cambio de región. ");
    }
    if(status !== undefined) {
        file.status = status;
        reg("Cambio de categoría de uso del muelle. ");
    }
    if(coordinates !== undefined) {
        file.coordinates = coordinates;
        reg("Cambio de coordenadas. ");
    }
    if(notes !== undefined) {
        file.notes = notes;
        reg("Cambio de observaciones. ");
    }
    if(hasAddressChanged && (await existsByAddress(file.region as string, file.address)))
        throw new ColError(E.DuplicationError);
    if([name, address, region, status, coordinates, notes].every((x: any): boolean => x === undefined)) {
        throw new ColError(E.AtLeastOneFieldRequiredError);
    }
    return;

};
export const explore = async ({ q, paginator, coordinates, radio, prefer }: IDockExploreRequest): Promise<IDockView[]> => {
    let preferObj: any = {
        status: prefer,
        name: { $regex: q || "", $options: "i" },
    };
    if (prefer === -1) {
        preferObj = {
            status: { $gt: -1 },
            name: { $regex: q || "", $options: "i" },
        };
    }
    preferObj = {
        ...preferObj,
        active: true
    }
    const query: FilterQuery<IDock> = {
        $and: [
            {
                coordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [ ...coordinates ], // [longitud, latitud]
                        },
                        $maxDistance: radio,
                    },
                },
            },
            preferObj,
        ],
    };
    const { data, error }: FetchResult<IDockView> = await Dock.listData(query, {
        page: paginator.page,
        itemsPerPage: paginator.size,
    });
    if(error) throw new ColError(error);
    return data;
};
export const get = async ({ id: _id, responsible }: ISensibleAction): Promise<IDockView> => {
    const isAdmin: boolean = responsible !== undefined && responsible !== null && responsible.role === 3;
    const { data: [file], error }: FetchResult<IDockView> = await Dock.listData({
        _id, ...(isAdmin ? {} : { active: true })
    }, { page: 0, itemsPerPage: 1 });
    if(error) throw new ColError(error);
    if(file === undefined) throw new ColError(E.ResourceNotFound);
    return file;
};
export const find = async ({ q, paginator: { page, size: itemsPerPage }, prefer }: IDockFindRequest): Promise<IDockView[]> => {
    const query: FilterQuery<IDock> = {
        $and: [{
                status: prefer || -1,
                ...(prefer === -1 ? { status: { $gt: -1 }} : {}),
                active: true
            }, {
                name: { $regex: q || "", $options: "i" },
        }]
    };
    const { data, error }: FetchResult<IDockView> = await Dock.listData(query, { page, itemsPerPage });
    if(error) throw new ColError(error);
    return data;
};