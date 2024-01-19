"use strict";
import {Schema, Types, model, Model} from "mongoose";
import ValidationSchema from "./Validation";
import IValidation from "../interfaces/models/IValidation";
import {IAvailabilityResponseSample} from "../interfaces/responses/Availability.interfaces";
import IAvailability from "../interfaces/models/IAvailability";
import HistoryEvent from "./HistoryEvent";

// TODO: Agregar endpoint para verificar si un horario está disponible en X condiciones / Condiciones del horario en cuestión.
/*const conditionOptions: string[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
    "HOLIDAY",
    "HIGH_TIDE",
    "LOW_TIDE",
];

const requiredP: string[] = ["path", "condition", "available"]; */

interface IAvailabilityModel extends Model<IAvailability> { }

const AvailabilitySchema: Schema<IAvailability, IAvailabilityModel> = new Schema<IAvailability, IAvailabilityModel>({
    path: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Path",
    },
    condition: {
        type: String,
        required: true,
        ref: "Path",
        minlength: 3,
        maxlength: 24,
    },
    available: {
        type: Boolean,
        required: true,
        default: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
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
    history: {
        type: [ HistoryEvent ],
        select: false
    },
    validations: [ValidationSchema],
});

const Availability: IAvailabilityModel = model<IAvailability, IAvailabilityModel>("Availability", AvailabilitySchema);
export default Availability;