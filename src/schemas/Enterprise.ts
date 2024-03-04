"use strict";
import mongoose, {FilterQuery, Model, Schema} from "mongoose";
import { ObjectId } from "mongodb";
import ValidationSchema from "./Validation";
import { IEnterpriseAddPhoneResponse } from "../interfaces/responses/Enterprise.interfaces";
import IEnterprise from "../interfaces/models/IEnterprise";
import HistoryEvent from "./HistoryEvent";
import ISchedule from "../interfaces/models/ISchedule";
import FetchResult from "../interfaces/responses/FetchResult";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";

export interface IEnterpriseMethods {
    addPhone(phoneNumber: string, user: string): Promise<IEnterpriseAddPhoneResponse>;
    deletePhone(phoneNumber: string, user: string): Promise<IEnterpriseAddPhoneResponse>;
}

export interface IEnterpriseView {
    _id: Schema.Types.ObjectId | string;
    cuit: number;
    name: string;
    user: {
        _id: Schema.Types.ObjectId | string;
        name: string;
        username: string;
    };
    description: string;
    uploadDate: string | Date;
    foundationDate: string | Date;
    phones: string[];
    active: boolean;
    __v: number;
}

interface IEnterpriseModel extends Model<IEnterprise, {}, IEnterpriseMethods> {
    listData(query: FilterQuery<IEnterprise>, { page, itemsPerPage }: { page: number, itemsPerPage: number }): Promise<FetchResult<IEnterpriseView>>;
}

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

enterpriseSchema.statics.listData = async function(query: FilterQuery<IEnterprise>, { page, itemsPerPage }): Promise<FetchResult<IEnterpriseView>> {
    try {
        const skip: number = page * itemsPerPage;
        let resources = await this.find(query)
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
            data: [ ...(resources as unknown as IEnterpriseView[]) ],
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