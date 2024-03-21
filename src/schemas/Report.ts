import mongoose, {Model, Schema} from "mongoose";
import {Role} from "../ext/users/defs";

export type RecordCategory =
    "availability" | "boat" | "comment" | "dock" | "enterprise" | "path" | "picture" | "schedule" | "user" | "region" | "other";
export enum ReportReason {
    /**
     * El contenido no está relacionado directamente con el registro en cuestión.
     */
    OUT_OF_TOPIC = 0,
    /**
     * Contenido publicitario, repetitivo y/o engañoso.
     */
    SPAM = 1,
    /**
     * Contenido inapropiado
     */
    NSFW_CONTENT = 2,
    /**
     * Amenazas, insultos
     */
    VIOLENCE = 3,
    /**
     * Otra razón
     */
    OTHER = 4
}
export enum ReportStatus {
    /**
     * **Enviado.**
     * El reporte fue enviado y será visto por algún administrador a la brevedad.
     */
    SENT = 0,
    /**
     * **Visto.** El reporte fue visto por un administrador.
     */
    INFORMED = 1,
    /**
     * **Trabajando.** El administrador está trabajando en solucionar el problema.
     */
    WORKING = 2,
    /**
     * **Solucionado.** El problema fue solucionado y el reporte fue cerrado.
     */
    FIXED = 3,
    /**
     * **Cerrado.** El reporte simplemente fue cerrado.
     */
    CLOSED = 4,
    /**
     * **Contra reportado**. El reporte es inapropiado. Podría resultar en un bloqueo.
     */
    REPORTED_BACK = 5
}
export interface IReport {
    _id: Schema.Types.ObjectId | string;
    resource: Schema.Types.ObjectId | string;
    type: RecordCategory;
    reason: ReportReason;
    details: string;
    status: ReportStatus;
    user: Schema.Types.ObjectId | string;
    admin: Schema.Types.ObjectId | string | null;
    officialMessage: string;
    uploadDate: Date;
}
export interface IReportView {
    _id: Schema.Types.ObjectId | string;
    resource: Schema.Types.ObjectId | string;
    type: RecordCategory;
    reason: ReportReason;
    details: string;
    status: ReportStatus;
    user: { _id: Schema.Types.ObjectId | string, name: string, username: string, role: Role };
    admin?: { _id: Schema.Types.ObjectId | string, name: string, username: string, role: Role };
    officialMessage?: string;
    uploadDate: Date | string;
}
export interface IReportMethods {

}
export interface IReportModel extends Model<IReport, {}, IReportMethods> {

}

const reportSchema = new Schema<IReport, IReportModel, IReportMethods>({
    resource: {
        type: Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ["availability", "boat", "comment", "dock", "enterprise", "path", "picture", "schedule", "user", "region", "other"]
    },
    reason: {
        type: Number,
        required: true,
        enum: [0,1,2,3,4]
    },
    details: {
        type: String,
        required: true,
        maxlength: 256
    },
    status: {
        type: Number,
        required: true,
        enum: [0,1,2,3,4,5],
        default: 0
    },
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    admin: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "User",
        default: null
    },
    officialMessage: {
        type: String,
        required: false,
        maxlength: 256,
        default: ""
    },
    uploadDate: {
        type: Date,
        required: true,
        default: () => Date.now()
    }
});

export default mongoose.model<IReport, IReportModel>("Report", reportSchema);