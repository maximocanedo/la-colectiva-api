import {Document, Schema} from "mongoose";
import IEnterprise from "../../interfaces/models/IEnterprise";
import {IEnterpriseMethods} from "../../schemas/Enterprise";
import IUser from "../../interfaces/models/IUser";
import {IPaginator} from "../../endpoints/pre";

export type EnterpriseDocument = (Document<unknown, {}, IEnterprise> & Omit<IEnterprise & Required<{_id: string | Schema.Types.ObjectId}>, keyof IEnterpriseMethods> & IEnterpriseMethods) | null;

export type CUIT = number;
export interface IEnterpriseCreateProps {
    cuit: CUIT;
    name: string;
    description: string;
    foundationDate: Date;
    phones: string[];
    responsible: IUser;
}
export interface IEnterpriseCreateResponse {
    _id: string | Schema.Types.ObjectId;
}
export interface IEnterpriseUpdateRequiredProps {
    id: string | Schema.Types.ObjectId;
    responsible: IUser;
}
export interface IEnterpriseGetProps {
    id: string | Schema.Types.ObjectId;
    responsible?: IUser;
}
export interface IEnterpriseDeleteProps extends IEnterpriseUpdateRequiredProps {}
export interface IEnterpriseEditProps extends IEnterpriseUpdateRequiredProps {
    cuit?: CUIT;
    name?: string;
    description?: string;
    foundationDate?: Date;
}
export interface IEnterpriseFindProps {
    q?: string;
    paginator: IPaginator;
}
export interface IEnterpriseUpdatePhoneProps extends IEnterpriseUpdateRequiredProps {
    phone: string;
}