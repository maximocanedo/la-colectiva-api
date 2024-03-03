import {OID} from "../boats/defs";
import IUser from "../../interfaces/models/IUser";
import { Document, Schema } from "mongoose";
import IPath from "../../interfaces/models/IPath";
import {IPaginator} from "../../endpoints/pre";
import {AvailabilityCondition} from "../../schemas/Availability";
import IAvailability from "../../interfaces/models/IAvailability";
export type PathDocument = (Document<unknown, {}, IPath> & IPath & Required<{_id: string | Schema.Types.ObjectId}>) | null;
export interface IPathCreateRequest {
    boat: OID;
    title: string;
    description: string;
    notes: string;
    responsible: IUser;
}
export interface IPathCreateResponse {
    _id: OID;
}
export interface ISensibleAction {
    id: OID | string;
    responsible: IUser;
}
export interface IPathEditRequest extends ISensibleAction {
    boat?: OID;
    title?: string;
    description?: string;
    notes?: string;
}
export interface IPathGetRequest {
    id: OID | string;
    responsible?: IUser;
}
export interface IPathListRequest {
    q: string;
    paginator: IPaginator;
}
export type AvailabilityDocument = (Document<unknown, {}, IAvailability> & IAvailability & Required<{_id: string | Schema.Types.ObjectId}>) | null;
export interface IPathAvailabilityCreateRequest {
    id: OID | string;
    responsible: IUser;
    condition: AvailabilityCondition;
    available: boolean;
}
export interface IPathAvailabilityCreateResponse {
    _id: OID | string;
}