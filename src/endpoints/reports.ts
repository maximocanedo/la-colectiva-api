
import dotenv from "dotenv";
import express, {Request, Response, Router} from "express";
import pre, {IPaginator} from "./pre";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";
import * as reports from "./../ext/reports";
import Joi from "joi";
import IUser from "../interfaces/models/IUser";
import {RecordCategory, ReportReason, ReportStatus} from "../schemas/Report";


dotenv.config();
const router: Router = express.Router();

router.use(express.json());

router.post("/", pre.authenticate(false),
    pre.expect({
        reason: Joi.number().valid(0,1,2,3,4).required(),
        type: Joi.string().valid("availability", "boat", "comment", "dock", "enterprise", "path", "picture", "schedule", "user", "region", "other").required(),
        details: Joi.string().max(256).allow(""),
        resource: Joi.string().max(32).min(24).required(),
    }),
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { reason, type, details, resource } = req.body;
            const { _id } = await reports.report({reason, type, details, resource, responsible: <IUser>req.user});
            res.status(201).json({ _id }).end();
        }
        catch(err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error}).end();
        }
    }
);

router.get("/", pre.authenticate(false),
    pre.paginate,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {
                q,
                type,
                reason,
                status
            } = req.query as { q?: string, type?: string, reason?: string, status?: string };
            const query = { q, type, reason, status };
            const schema = Joi.object().keys({
                q: Joi.string().max(256),
                type: Joi.string().valid("availability", "boat", "comment", "dock", "enterprise", "path", "picture", "schedule", "user", "region", "other"),
                reason: Joi.number().valid(0,1,2,3,4),
                status: Joi.number().valid(0,1,2,3,4,5)
            });
            const user: IUser = <IUser>req.user;
            const nType: RecordCategory | undefined = type === undefined ? undefined : type as RecordCategory;
            const nReason: ReportReason | undefined = reason === undefined ? undefined : Number(reason);
            const nStatus: ReportStatus | undefined = status === undefined ? undefined : Number(status);
            if(schema.validate(query)) {
                const arr = await reports.get(query.q?? "", req.paginator as IPaginator, user, nType, nReason, nStatus);
                res.status(200).json({data: arr}).end();
            } else {
                res.status(400).json({ error: E.InvalidInputFormatError }).end();
            }
        } catch(err) {
            console.log(err);
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({error}).end();
        }
    }
);

router.patch("/:id", pre.auth, pre.allow.admin,
    pre.expect({
        officialMessage: Joi.string().max(256),
        status: Joi.number().valid(0,1,2,3,4,5)
    }), async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const user: IUser = <IUser>req.user;
        const { status, officialMessage } = req.body;
        await reports.patch(id, user, status, officialMessage);
        res.status(204).end();
    } catch(err) {
        const { http, ...error}: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({ error }).end();
    }
});

export default router;