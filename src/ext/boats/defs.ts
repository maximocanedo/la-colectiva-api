import IUser from "../../interfaces/models/IUser";
import {Document, Schema} from "mongoose";
import IBoat from "../../interfaces/models/IBoat";
import {IPaginator} from "../../endpoints/pre";
export type BoatDocument = (Document<unknown, {}, IBoat> & IBoat & Required<{_id: string | Schema.Types.ObjectId}>) | null;
export type OID = string | Schema.Types.ObjectId;
export interface IBoatCreateRequiredProps {
    responsible: IUser;
    mat: string;
    name: string;
    status: boolean;
    enterprise: OID;
}
export interface IBoatCreateResponse {
    _id: OID;
}
export interface ISensibleAction {
    responsible: IUser;
    id: OID;
}
export interface IBoatEditRequest extends ISensibleAction {
    mat?: string;
    name?: string;
    status?: boolean;
    enterprise?: OID;
}
export interface IBoatEditResponse {

}
export interface IFindBoatRequest {
    q: string;
    paginator: IPaginator;
    enterprise?: OID;
}