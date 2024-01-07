'use strict';
import MailVerification from "../../schemas/MailVerification";
import pre from "../../endpoints/pre";
import crypto from "crypto";
import {Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {mail} from "../../validators/user.v";
import User from "../../schemas/User";
import {Schema} from "mongoose";
import SMTPTransport from "nodemailer/lib/smtp-transport";

dotenv.config();


const transporter = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_SERVER as string,
    port: parseInt(process.env.MAIL_SMTP_PORT as string),
    auth: {
        user: process.env.MAIL_SMTP_IDENTIFIER as string,
        pass: process.env.MAIL_SMTP_PASSWORD as string,
    },
});
interface ISendCodeResponse {
    validationId: string | Schema.Types.ObjectId | null,
    error: IError | null,
    code: number
}
const sendCode = async (user: any, mail: string): Promise<ISendCodeResponse> => {
    try {
        let randomNumSixDigits: number = Math.floor(Math.random() * 1000000);
        let hash: string = crypto.createHash('sha256').update(randomNumSixDigits.toString()).digest('hex');

        let data = {
            code: hash,
            user: user._id,
            mail,
            expirationDate: Date.now() + 1000 * 60 * 60 * 24,
            active: false
        };
        const mailStatus = await transporter.sendMail({
            from: `La Colectiva <${process.env.MAIL_SMTP_IDENTIFIER as string}>`,
            to: mail,
            subject: "¡Verificá tu cuenta!",
            html: "Usá el siguiente código para verificar tu cuenta: <b>" + randomNumSixDigits + "</b>. <br /><br /><i>Si no solicitaste un código, o si no tenés cuenta en La Colectiva, ignorá este mail.</i>"
        });
        let mailVerification = new MailVerification(data);
        const result = await mailVerification.save();
        return { validationId: result._id, error: null, code: 200 };
    } catch(err) {
        const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
        return { validationId: null, error, code: 500 };
    }
}


const mailContent = {
    def: [
        "Verificación exitosa",
        "Vinculaste con éxito tu dirección de correo electrónico a tu cuenta de La Colectiva. "
    ],
    res: [
        "¡Bienvenido de nuevo!",
        "Rehabilitaste tu cuenta de La Colectiva con éxito. "
    ]
};

const startMailVerification = [
    pre.auth,
    pre.expect({
        mail: mail
    }),
    async (req: Request, res: Response): Promise<void> => {
        const {code, validationId, error } = await sendCode(req.user, req.body.mail);
        res.status(code).json(!validationId ? {error} : {validationId});
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
            const user = await User.findOne({ _id: mailVerification.user, active: true });
            if(!user) {
                res.status(403).json({
                    error: E.InternalError // User does not exist anymore.
                });
                return;
            }
            let mailTitle: string = mailContent.def[0],
                mailBody: string = mailContent.def[1];
            const hash: string = crypto.createHash('sha256').update(code.toString()).digest('hex');
            if (hash !== mailVerification.code) {
                res.status(401).end();
            } else {
                mailVerification.active = true;
                if(!user.email || typeof user.email === 'undefined') {
                    user.role = 1;
                }
                if(!user.active) {
                    user.active = true;
                    mailTitle = mailContent.res[0];
                    mailBody = mailContent.res[1];
                }
                user.email = mailVerification.mail;
                await mailVerification.save();
                await user.save();
                const mailStatus: SMTPTransport.SentMessageInfo = await transporter.sendMail({
                    from: `La Colectiva <${process.env.MAIL_SMTP_IDENTIFIER as string}>`,
                    to: mailVerification.mail,
                    subject: mailTitle,
                    html: mailBody
                });

                res.status(204).end();

            }
        } catch(err) {
            const error: IError | null = defaultHandler(err as Error, E.AuthenticationError);
            res.status(500).json({ error });
        }
    }
]

export {startMailVerification, sendCode, validateMail};