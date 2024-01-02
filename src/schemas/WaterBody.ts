"use strict";
import mongoose, {Model, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import Comment from "./Comment";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import IWaterBody from "../interfaces/models/IWaterBody";

const WATERBODY_TYPE: any = {
    RIVER: 0, // Río
    STREAM: 1, // Arroyo
    BROOK: 2, // Riachuelo
    CANAL: 3, // Canal
    LAKE: 4, // Lago
    POND: 5, // Estanque
    LAGOON: 6, // Laguna
    RESERVOIR: 7, // Embalse
    SWAMP: 8, // Pantano
    WELL: 9, // Pozo
    AQUIFER: 10, // Acuífero
    BAY: 11, // Bahía
    GULF: 12, // Golfo
    SEA: 13, // Mar
    OCEAN: 14, // Océano
};

interface IWaterBodyModel extends Model<IWaterBody> { }

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
    validations: [ValidationSchema],
});


export default mongoose.model<IWaterBody, IWaterBodyModel>("WaterBody", waterBodySchema);