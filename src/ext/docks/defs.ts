import IUser from "../../interfaces/models/IUser";
import {OID} from "../boats/defs";
import IDock, {DockPropertyStatus} from "../../interfaces/models/IDock";
import {Document, ObjectId} from "mongoose";
import {IPaginator} from "../../endpoints/pre";
export type DockDocument = (Document<unknown, {}, IDock> & IDock & Required<{_id: string | ObjectId}>) | null;
export interface IDockCreateRequest {
    responsible: IUser;
    name: string;
    address: number;
    region: OID;
    notes: string;
    status: DockPropertyStatus;
    coordinates: [number, number];
}
export interface IDockCreateResponse {
    _id: OID;
}
export interface ISensibleAction {
    responsible: IUser;
    id: OID;
}
export interface IDockEditRequest extends ISensibleAction {
    name: string;
    address: number;
    region: OID;
    notes: string;
    status: DockPropertyStatus;
    coordinates: [ number, number ];
}
export interface IDockExploreRequest {
    coordinates: [ number, number ];
    radio: number;
    prefer: DockPropertyStatus | -1;
    q: string;
    paginator: IPaginator;
    light: boolean;
}
export interface IDockFindRequest {
    q: string;
    paginator: IPaginator;
    prefer: DockPropertyStatus | -1;
}