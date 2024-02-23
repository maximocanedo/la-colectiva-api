'use strict';
import User from "../../schemas/User";
import E from "../../errors";
import {
    IEmailVerificationDocument, ILoginParams, ILoginResult,
    IStartMailVerificationParams,
    IUserDisableParams,
    IUserDocument,
    IUserEditParams,
    IUserEnableParams,
    IUserFindParams, IUserPasswordUpdateParams, IUserRoleUpdateParams,
    IUserSignUpRequiredFields
} from "./defs";
import ColError from "../error/ColError";
import {ISendCodeResponse} from "../../actions/users/startMailVerification";
import IUser from "../../interfaces/models/IUser";
import crypto from "crypto";
import MailVerification from "../../schemas/MailVerification";
import nodemailer, {SentMessageInfo} from "nodemailer";
import {FilterQuery, Schema} from "mongoose";
import jwt from "jsonwebtoken";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import SMTPTransport from "nodemailer/lib/smtp-transport";

export const isAdmin = (user: IUser): boolean => user.role === 3;
/**
 * Crea un nuevo usuario.
 * @param username
 * @param name
 * @param email
 * @param bio
 * @param birth
 * @param password
 */
export const create = async ({ username, name, email, bio, birth, password }: IUserSignUpRequiredFields): Promise<ISendCodeResponse> => {
    const usernameIsAvailable: boolean = await User.isUsernameAvailable( username );
    if (!usernameIsAvailable) throw new ColError(E.DuplicationError);
    const emailOwner: IUserDocument = await User.findOne({email: email});
    if(emailOwner) throw new ColError(E.DuplicationError);
    const newUser: IUserDocument = new User({
        username,
        name,
        bio,
        birth,
        email: `${username}@colectiva.com.ar`,
        password
    });
    const user: IUserDocument = await newUser.save();
    return await sendVerificationCode({ user, email });
};
/**
 * Crea un token (Inicia sesión) para un usuario.
 * @param username
 * @param password
 * @param email
 * @param exp
 */
export const login = async ({ username, password, email, exp }: ILoginParams): Promise<ILoginResult> => {
    let query: FilterQuery<IUser> = {
        active: true,
    };
    if (username !== undefined) {
        query.$or = [{ username }];
    } else if (email !== undefined) {
        query.$or = [ ...(query.$or?? []), { email }];
    } else throw new ColError(E.AuthenticationError);

    const user: IUserDocument = await User.findOne(query)
    if(!user) throw new ColError(E.InvalidCredentials);
    const passwordMatches: boolean = await user.comparePassword(password);
    if(!passwordMatches) throw new ColError(E.InvalidCredentials);
    const token: string = jwt.sign({
        user: user._id
    }, process.env.JWT_SECRET_KEY as string, {
        expiresIn: exp?? "8h"
    });

    return {
        success: true,
        user,
        token
    };

};
/**
 * Deshabilita un usuario.
 * @param responsible
 * @param username
 */
export const disable = async ({ responsible, username }: IUserDisableParams): Promise<boolean> => {
    if(!isAdmin(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const user: IUserDocument = await User.findOne({ username });
    if(!user) throw new ColError(E.ResourceNotFound);
    user.active = false;
    await user.save();
    return true;
};
/**
 * Habilita un usuario.
 * @param responsible
 * @param username
 */
export const enable = async ({ responsible, username }: IUserEnableParams): Promise<boolean> => {
    if(!isAdmin(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const user: IUserDocument = await User.findOne({ username });
    if(!user) throw new ColError(E.ResourceNotFound);
    user.active = false;
    await user.save();
    return true;
};
/**
 * Editar datos personales de un usuario.
 * @param responsible
 * @param username
 * @param name
 * @param bio
 * @param birth
 */
export const edit = async ({ responsible, username, name, bio, birth }: IUserEditParams): Promise<boolean> => {
    if(responsible.username !== username && !isAdmin(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const user: IUserDocument = await User.findOne({ username, active: true });
    if (!user) throw new ColError(E.ResourceNotFound)
    if(name !== undefined) user.name = name;
    if(bio !== undefined) user.bio = bio;
    if(birth !== undefined) user.birth = birth;
    if(!name && !bio && !birth) throw new ColError(E.AtLeastOneFieldRequiredError);
    await user.save();
    return true;
};
/**
 * Buscar usuario por nombre de usuario.
 * @param responsible
 * @param username
 */
export const find = async ({ responsible, username }: IUserFindParams): Promise<IUser> => {
    const query: any = !responsible ? { active: true } : {};
    const user: IUserDocument = await User.findOne({ ...query, username }, { password: 0 });
    if(!user) throw new ColError(E.ResourceNotFound);
    return user;
};
const transporter: nodemailer.Transporter<SentMessageInfo> = nodemailer.createTransport({
    host: process.env.MAIL_SMTP_SERVER as string,
    port: parseInt(process.env.MAIL_SMTP_PORT as string),
    auth: {
        user: process.env.MAIL_SMTP_IDENTIFIER as string,
        pass: process.env.MAIL_SMTP_PASSWORD as string,
    },
});
/**
 * Envía un código de verificación por correo.
 * @param user
 * @param mail
 */
const sendVerificationCode = async ({ user, email }: IStartMailVerificationParams): Promise<ISendCodeResponse> => {
    if(!user) throw new ColError(E.ResourceNotFound);
    const random: number = Math.floor(Math.random() * 1000000);
    const hash: string = crypto.createHash('sha256').update(random.toString()).digest('hex');
    await transporter.sendMail({
        from: `La Colectiva <${process.env.MAIL_SMTP_IDENTIFIER as string}>`,
        to: email,
        subject: "¡Verificá tu cuenta!",
        html: "Usá el siguiente código para verificar tu cuenta: <b>" + random + "</b>. <br /><br /><i>Si no solicitaste un código, o si no tenés cuenta en La Colectiva, ignorá este mail.</i>"
    });
    const mailVerification: IEmailVerificationDocument = new MailVerification({
        code: hash,
        user: new Schema.Types.ObjectId(user._id as string),
        email,
        expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        active: false
    });
    const result: IEmailVerificationDocument = await mailVerification.save();
    return { validationId: result._id, error: null, code: 200 };
};
/**
 * Actualiza la contraseña del usuario.
 * @param username
 * @param password
 */
export const updatePassword = async ({ responsible: { username }, password }: IUserPasswordUpdateParams): Promise<boolean> => {
    const user: IUserDocument = await User.findOne({ username, active: true });
    if(!user) throw new ColError(E.ResourceNotFound);
    user.password = password;
    await user.save();
    return true;
};
/**
 * Actualiza el rol de un usuario.
 * @param responsible
 * @param username
 * @param role
 */
export const updateRole = async ({ responsible, username, role }: IUserRoleUpdateParams): Promise<boolean> => {
    if(!isAdmin(responsible)) throw new ColError(E.AttemptedUnauthorizedOperation);
    const user: IUserDocument = await User.findOne({ username, active: true });
    if (!user) throw new ColError(E.ResourceNotFound);
    user.role = role;
    await user.save();
    return true;
};