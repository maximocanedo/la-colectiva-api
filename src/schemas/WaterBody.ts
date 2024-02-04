"use strict";
import mongoose, {FilterQuery, Model, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import IWaterBody from "../interfaces/models/IWaterBody";
import HistoryEvent from "./HistoryEvent";
import FetchResult from "../interfaces/responses/FetchResult";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";

export enum RegionType {
    RIVER = 0, // Río
    STREAM = 1, // Arroyo
    BROOK = 2, // Riachuelo
    CANAL = 3, // Canal
    LAKE = 4, // Lago
    POND = 5, // Estanque
    LAGOON = 6, // Laguna
    RESERVOIR = 7, // Embalse
    SWAMP = 8, // Pantano
    WELL = 9, // Pozo
    AQUIFER = 10, // Acuífero
    BAY = 11, // Bahía
    GULF = 12, // Golfo
    SEA = 13, // Mar
    OCEAN = 14 // Océano
};

export interface IRegionView {
    _id: Schema.Types.ObjectId | string;
    name: string;
    user: {
        _id: Schema.Types.ObjectId | string;
        name: string;
        username: string;
    };
    type: RegionType;
    uploadDate: string | Date;
    active: boolean;
    __v: number;
}

interface IWaterBodyModel extends Model<IWaterBody> {
    listData(query: FilterQuery<IWaterBody>, { page, itemsPerPage }: { page: number, itemsPerPage: number }): Promise<FetchResult<IRegionView>>;
}

const waterBodySchema: Schema<IWaterBody, IWaterBodyModel> = new Schema<IWaterBody, IWaterBodyModel>({
    name: {
        type: String,
        maxlength: 48,
        minlength: 3,
        required: true,
    },
    user: {
        type: ObjectId,
        required: true,
        ref: "User",
    },
    type: {
        type: Number,
        required: true,
        enum: Object.values(RegionType)
        // Validar alcance
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
    comments: [
        {
            type: ObjectId,
            ref: "Comment",
        },
    ],
    history: {
        type: [ HistoryEvent ],
        select: false
    },
    validations: [ValidationSchema],
});


waterBodySchema.statics.listData = async function(query: FilterQuery<IWaterBody>, { page, itemsPerPage }): Promise<FetchResult<IRegionView>> {
    try {
        const skip: number = page * itemsPerPage;
        const res = await this.find(query)
            .select({ validations: 0, comments: 0 })
            .populate({
                path: "user",
                model: "User",
                select: "_id name username"
            })
            .skip(skip)
            .limit(itemsPerPage);
        return {
            status: 200,
            data: res as unknown as IRegionView[],
            error: null
        };
    } catch(err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        return {
            status: 500,
            data: [],
            error
        };
    }
}


export default mongoose.model<IWaterBody, IWaterBodyModel>("WaterBody", waterBodySchema);