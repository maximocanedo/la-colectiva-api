import IWaterBody from "../../interfaces/models/IWaterBody";
import {Document, Schema} from "mongoose";
import IUser from "../../interfaces/models/IUser";
import {IRegionView, RegionType} from "../../schemas/WaterBody";
import FetchResult from "../../interfaces/responses/FetchResult";
import {IPaginator} from "../../endpoints/pre";

export type IRegionDocument = Document<unknown, {}, IWaterBody> & IWaterBody & Required<{_id: string | Schema.Types.ObjectId}>;
export interface ICreateRegionProps {
    responsible: IUser;
    name: string;
    type: RegionType;
}
export interface ICreateRegionResponse {
    _id: Schema.Types.ObjectId | string;
}
export type GetRegionResult = Omit<FetchResult<IRegionView>, "status">;
export interface IGetRegionProps {
    id: Schema.Types.ObjectId | string;
    responsible?: IUser;
}
export interface IFindRegionsProps {
    paginator: IPaginator;
    q: string;
}
export interface IUpdateRegionProps {
    id: Schema.Types.ObjectId | string;
    responsible: IUser;
}
export interface IEditableRegion {
    name?: string;
    type?: RegionType;
}