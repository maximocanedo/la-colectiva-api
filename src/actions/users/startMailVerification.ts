'use strict';
import MailVerification from "../../schemas/MailVerification";
import pre from "../../endpoints/pre";
import crypto from "crypto";
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";

const startMailVerification = [
    pre.auth,
    // Validar mail.
    async (req: Request, res: Response): Promise<void> => {
        try {
            let randomNumSixDigits: number = Math.floor(Math.random() * 1000000);
            let hash: string = crypto.createHash('sha256').update(randomNumSixDigits.toString()).digest('hex');

            let data = {
                code: hash,
                user: req.user._id,
                mail: req.body.mail,
                expirationDate: Date.now() + 1000 * 60 * 60 * 24,
                active: false
            };

            let mailVerification = new MailVerification(data);
            const result = await mailVerification.save();
            res.status(201).json({ validationId: result._id, __code$: randomNumSixDigits }).end();
        } catch(err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

const validateMail = [
    pre.auth,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const {code} = req.body;
            const {validationId} = req.params;
            const mailVerification = await MailVerification.findOne({_id: validationId, active: false});
            if (!mailVerification) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            const hash = crypto.createHash('sha256').update(code.toString()).digest('hex');
            if (hash !== mailVerification.code) {
                res.status(401).end();
            } else {
                mailVerification.active = true;
                await mailVerification.save();
                res.status(204).end();

            }
        } catch(err) {
            const error: IError | null = defaultHandler(err as Error, E.AuthenticationError);
            res.status(500).json({ error });
        }
    }
]

export {startMailVerification, validateMail};