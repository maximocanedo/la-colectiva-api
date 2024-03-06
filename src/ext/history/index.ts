import {IHistoryEvent} from "../../schemas/HistoryEvent";
import {Document, Model, Types} from "mongoose";
import {IPaginator} from "../../endpoints/pre";
import IUser from "../../interfaces/models/IUser";
import ColError from "../error/ColError";
import E from "../../errors";

interface IHistoryListRequest {
    _id: Types.ObjectId | string;
    model: any;
    responsible?: IUser;
    paginator: IPaginator;
}
export const getHistory = async ({ _id, model, responsible, paginator: { page, size } }: IHistoryListRequest): Promise<IHistoryEvent[]> => {
    const isAdmin: boolean = responsible !== null && responsible !== undefined && responsible.role === 3;
    const file = await model.findOne({ _id, ...(isAdmin ? {} : {active: true}) }, { history: 1 })
        .populate("history.user", "name username active _id role");
    // Ordenar la historia por 'time' de forma descendente
    const sortedHistory = file.history.sort((a: IHistoryEvent, b: IHistoryEvent) => new Date(b.time).getTime() - new Date(a.time).getTime());

    if(!file) throw new ColError(E.ResourceNotFound);
    const totalCount = file.history.length;
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, totalCount);

    return file.history.slice(startIndex, endIndex);
};