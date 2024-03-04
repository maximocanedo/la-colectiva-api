"use strict";
import crypto, {Decipher} from "crypto";
import dotenv from "dotenv";
import {NextFunction, Request, Response} from "express";
import multer, {Multer, StorageEngine} from "multer";
import path from "path";
import User from "../schemas/User";
import jwt from 'jsonwebtoken';
import * as Joi from 'joi';
import {IError} from "../interfaces/responses/Error.interfaces";
import E from "../errors/index";
import {handlers} from "../errors/handlers";
import {endpoint} from "../interfaces/types/Endpoint";
import IUser from "../interfaces/models/IUser";

dotenv.config();
/**
 * Cifra un texto con el algoritmo y la clave secreta especificados en el archivo .env
 * @param text Texto a cifrar
 */
const encrypt = (text: string): string => {
    const n_iv = parseInt(process.env.UID_IV_LENGTH as string);
    let iv = crypto.randomBytes(n_iv);
    let cipher = crypto.createCipheriv(
        process.env.UID_ALGORITHM as string,
        Buffer.from(process.env.UID_SECRET_KEY as string, "hex"),
        iv
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
};
/**
 * Descifra un texto cifrado con el algoritmo y la clave secreta especificados en el archivo .env
 * @param text Texto cifrado
 */
const decrypt = (text: string) => {
    let textParts: string[] = text.split(":");
    let iv: Buffer = Buffer.from(textParts.shift() as string, "hex");
    let encryptedText: Buffer = Buffer.from(textParts.join(":"), "hex");
    let decipher: Decipher = crypto.createDecipheriv(
        process.env.UID_ALGORITHM as string,
        Buffer.from(process.env.UID_SECRET_KEY as string, "hex"),
        iv
    );
    let decrypted: Buffer = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};
/**
 * Interfaz de token
 */
interface TokenInterface extends jwt.JwtPayload {
    user: string;
    iat: number;
    exp: number;
}
/**
 * Verifica que el usuario esté autenticado
 */
const authenticate = (continueOnError: boolean = false): endpoint => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader: string | undefined = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            if(continueOnError) {
                req.user = undefined;
                next();
                return;
            }
            res.status(401).json({error: E.Unauthenticated});
            return;
        }

        const token: string = (authHeader as string).split(' ')[1];
        if (!token) {
            if(continueOnError) {
                req.user = undefined;
                next();
                return;
            }
            res.status(401).json({error: E.Unauthenticated});
            return;
        }

        const decoded: TokenInterface = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as TokenInterface;
        const uid: string = decoded.user;
        const user = await User.findById(uid).select("-password");

        if (!user) {
            if(continueOnError) {
                req.user = undefined;
                next();
                return;
            }
            res.status(401).json({error: E.InvalidToken});
            return;
        }
        req.user = user;
        next();
    } catch (err) {
        if(err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError || err instanceof jwt.NotBeforeError) {
            const finalError: IError = handlers.jwtMiddleware(err);
            res.status(401).json({error: finalError});
            return;
        }
        res.status(500).json({error: E.InternalError});
    }
};
const auth: endpoint = authenticate(false);
export interface IPaginator {
    page: number,
    size: number
}
const paginate: endpoint = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const defaultPaginator: IPaginator = { page: 0, size: 10 };
    const rawPage: string = req.query.page ? (req.query.page as string) : (req.query.p as string);
    const rawSize: string = req.query.size ? (req.query.size as string) : (req.query.itemsPerPage as string);
    const parsedPage: number = parseInt(rawPage);
    const parsedSize: number = parseInt(rawSize);
    const page: number = isNaN(parsedPage) ? defaultPaginator.page : parsedPage;
    const size: number = isNaN(parsedSize) ? defaultPaginator.size : parsedSize;
    req.paginator = {
        page, size
    };
    next();
};
/**
 * Permite el acceso a los usuarios con un rol mayor o igual al especificado
 * @param role Rol mínimo requerido
 */
const allowAccessForRole = (role: number): endpoint => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user as IUser;
        if (user.role >= role) {
            next();
            return;
        }
        res.status(403).json({ error: E.AttemptedUnauthorizedOperation });
    } catch (err) {
        res.status(500).json({ error: E.InternalError });
    }
}
/**
 * Permite el acceso a los usuarios administradores.
 */
const adminsCanAccess = allowAccessForRole(3);
/**
 * Permite el acceso a los usuarios moderadores o administradores.
 */
const moderatorsCanAccess = allowAccessForRole(2);
/**
 * Permite el acceso a los usuarios normales, moderadores o administradores.
 */
const normalUsersCanAccess = allowAccessForRole(1);
/**
 * Permite el acceso a todos los usuarios, incluídos los usuarios con funciones limitadas.
 */
const everybodyCanAccess = allowAccessForRole(0);
/**
 * Verifica que los campos requeridos estén presentes en el cuerpo de la solicitud
 * @param requiredProps Campos requeridos
 * @deprecated Usar expect() en su lugar
 */
const verifyInput = (requiredProps: string[]) => (req: Request, res: Response, next: NextFunction): void => {
    const missingProps = requiredProps.filter((prop) => !(prop in req.body));
    if (missingProps.length > 0) {
        res.status(400).json({
            message: `Missing required properties: ${missingProps.join(", ")}`,
        });
        return;
    }
    next(); // Si todo está bien, pasa al siguiente middleware o al controlador
};
const imageFileTypes: string[] = ["image/jpeg", "image/png", "image/gif"]; // Tipos de archivos de imagen permitidos
const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const destinationPath = path.join(__dirname, "../.." + process.env.PIC_ROOT_FOLDER);
        cb(null, destinationPath);
    },
    filename: (req, file, cb): void => {
        // Generamos un nombre único para el archivo
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = file.originalname.split(".").pop();
        const user = (req.user as IUser)._id;
        const finalFileName = `${user}-${uniqueSuffix}.${fileExtension}`;
        cb(null, finalFileName);
    },
    // @ts-ignore
    fileFilter: (req: Request, file: Express.Multer.File, cb: any): void => {
        if (imageFileTypes.includes(file.mimetype)) {
            // Aceptar el archivo si el tipo de MIME está admitido
            cb(null, true);
        } else {
            // Rechazar si su tipo de MIME no es admitido
            cb(new Error("Invalid file type"));
        }
    },
});
const upload: Multer = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB en bytes
    },
});
const uploadPhoto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    upload.single("file")(req, res, function (err): void {
        if(err) console.log(err);
        if(err instanceof multer.MulterError) {
            const finalError: IError = handlers.multerErrorMiddleware(err);
            res.status(400).json({error: finalError});
        } else if(err) {
            res.status(500).json({ error: E.UploadError});
        } else next();
    });
};
/**
 * Verifica que los campos requeridos estén presentes en el cuerpo de la solicitud
 * @param keys Campos requeridos
 */
const expect = (keys: any) => async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const schema: Joi.ObjectSchema = Joi.object().keys(keys);
    const result: Joi.ValidationResult = schema.validate(req.body);
    if (result.error) {
        const error: IError = {
            ...E.ValidationError,
            details: (result.error as Joi.ValidationError).message
        };
        res.status(400).json({error});
        return;
    } else next();
};
const allow: any = {
    admin: allowAccessForRole(3),
    moderator: allowAccessForRole(2),
    normal: allowAccessForRole(1),
    all: allowAccessForRole(0),
};
export default {
    verifyInput,
    uploadPhoto,
    encrypt,
    expect,
    decrypt,
    authenticate,
    adminsCanAccess,
    moderatorsCanAccess,
    normalUsersCanAccess,
    everybodyCanAccess,
    allow,
    auth,
    paginate
};