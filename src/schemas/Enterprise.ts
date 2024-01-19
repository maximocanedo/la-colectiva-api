"use strict";
import mongoose, {Model, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import { IEnterpriseAddPhoneResponse } from "../interfaces/responses/Enterprise.interfaces";
import IEnterprise from "../interfaces/models/IEnterprise";
import HistoryEvent from "./HistoryEvent";

interface IEnterpriseMethods {
    addPhone(phoneNumber: string, user: string): Promise<IEnterpriseAddPhoneResponse>;
    deletePhone(phoneNumber: string, user: string): Promise<IEnterpriseAddPhoneResponse>;
}
interface IEnterpriseModel extends Model<IEnterprise, {}, IEnterpriseMethods> { }

const enterpriseSchema: Schema<IEnterprise, IEnterpriseModel, IEnterpriseMethods> = new Schema<IEnterprise, IEnterpriseModel, IEnterpriseMethods>({
    cuit: {
        type: Number,
        required: true,
        unique: true,
        // Validar
    },
    name: {
        type: String,
        maxlength: 48,
        minlength: 3,
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    description: {
        type: String,
        maxlength: 128,
        minlength: 3,
    },
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    foundationDate: {
        type: Date,
        required: true,
        default: Date.now(),
    },
    phones: [
        {
            type: String,
            minlength: 3,
            maxlength: 24,
        },
    ],
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


enterpriseSchema.methods.addPhone = async function (phoneNumber: string, user: string): Promise<IEnterpriseAddPhoneResponse> {
    try {
        this.phones.push(phoneNumber);
        this.history.push({
            content: "Agregar número de teléfono. ",
            time: Date.now(),
            user
        });
        await this.save();
        return {
            phones: this.phones,
            status: 200,
            msg: "Phone number added successfully.",
        };
    } catch (error) {
        return {
            phones: [],
            status: 500,
            error: error,
            msg: "Failed to add phone number.",
        };
    }
};
enterpriseSchema.methods.deletePhone = async function (phoneNumber: string, user: string): Promise<IEnterpriseAddPhoneResponse> {
    try {
        this.phones = this.phones.filter((phone: string): boolean => phone !== phoneNumber);
        this.history.push({
            content: "Eliminar número de teléfono. ",
            time: Date.now(),
            user
        });
        await this.save();
        return {
            phones: this.phones,
            status: 200,
            msg: "Phone number deleted successfully.",
        };
    } catch (error) {
        return {
            phones: this.phones,
            status: 500,
            error: error,
            msg: "Failed to delete phone number.",
        };
    }
};

export default mongoose.model<IEnterprise, IEnterpriseModel>("Enterprise", enterpriseSchema);