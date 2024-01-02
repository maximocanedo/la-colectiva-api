"use strict";
import crypto, {Decipher} from "crypto";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import Photo from "../schemas/Photo";
import multer, {Multer, StorageEngine} from "multer";
import path from "path";
import fs from "fs";
import User from "../schemas/User";
import jwt, {Jwt} from 'jsonwebtoken';

dotenv.config();
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
interface TokenInterface {
    user: string;
    iat: number;
    exp: number;
}
const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Need to authenticate.' });
            return;
        }

        const token: string = (authHeader as string).split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Need to authenticate.' });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        const uid = (decoded as TokenInterface).user; // Aquí deberías implementar tu lógica de descifrado
        const user = await User.findById(uid).select("-password");

        if (!user) {
            res.status(401).json({ message: "User not found." });
            return;
        }
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Internal error",
        });
    }
};
const adminsCanAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (user.role >= 3) {
            next();
            return;
        }
        res.status(403).json({
            message: "Action not allowed",
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal error",
        });
    }
};
const moderatorsCanAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (user.role >= 2) {
            next();
            return;
        }
        res.status(403).json({
            message: "Action not allowed",
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal error",
        });
    }
};
const normalUsersCanAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (user.role >= 1) {
            next();
            return;
        }
        res.status(403).json({
            message: "Action not allowed",
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal error",
        });
    }
};
const everybodyCanAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;
        if (user.role >= 0) {
            next();
            return;
        }
        res.status(403).json({
            message: "Action not allowed",
        });
    } catch (err) {
        res.status(500).json({
            message: "Internal error",
        });
    }
};
const verifyInput = (requiredProps: string[]) => (req: Request, res: Response, next: NextFunction) => {
    const missingProps = requiredProps.filter((prop) => !(prop in req.body));
    if (missingProps.length > 0) {
        return res.status(400).json({
            message: `Missing required properties: ${missingProps.join(", ")}`,
        });
    }
    next(); // Si todo está bien, pasa al siguiente middleware o al controlador
};
const imageFileTypes = ["image/jpeg", "image/png", "image/gif"]; // Tipos de archivos de imagen permitidos


const storage: StorageEngine = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb) => {
        const destinationPath = path.join(__dirname, "../data/photos/");
        cb(null, destinationPath);
    },
    filename: (req, file, cb): void => {
        // Generamos un nombre único para el archivo
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const fileExtension = file.originalname.split(".").pop();
        const user = req.user._id;
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
    upload.single("file")(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Error de Multer (tamaño excedido, etc.)
            res.status(400).json({
                message: "Bad Request: " + err.message,
            });
        } else if (err) {
            // Error en el filtro de archivos (tipo de archivo no permitido)
            res.status(400).json({
                message: "Bad Request: Invalid file type",
            });
        }
        // Si no hubo errores, pasa al siguiente middleware o al controlador
        next();
    });
};

const allow = {
    admin: adminsCanAccess,
    moderator: moderatorsCanAccess,
    normal: normalUsersCanAccess,
    all: everybodyCanAccess,
};
const auth = authenticate;
export default {
    verifyInput,
    uploadPhoto,
    encrypt,
    decrypt,
    authenticate,
    adminsCanAccess,
    moderatorsCanAccess,
    normalUsersCanAccess,
    everybodyCanAccess,
    allow,
    auth,
};