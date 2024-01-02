'use strict';
import mongoose, { Model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import IUser from "../interfaces/models/IUser";

const UserStatics = {
    roles: {
        // El usuario está bloqueado y está limitado a las funciones básicas (lectura)
        LIMITED: 0,
        // El usuario puede ver horarios, comentar objetos, dar likes, etc.
        NORMAL: 1,
        // El usuario puede agregar horarios, lugares, objetos, etc.
        MODERATOR: 2,
        // El usuario puede administrar los privilegios de los demás usuarios.
        ADMIN: 3,
    },
    properties: [
        "username",
        "name",
        "bio",
        "birth",
        "role",
        "password",
        "active",
    ],
};

const userSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        match: /^[a-zA-Z0-9_.]{3,24}$/,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        maxlength: 24,
        minlength: 3,
    },
    email: {
        type: String,
        required: false,
        match: /^.+@.+\..+$/,
        unique: true,
    },
    bio: {
        type: String,
        required: false,
        maxlength: 48,
    },
    birth: {
        type: Date,
        required: true,
    },
    role: {
        type: Number,
        required: true,
        default: UserStatics.roles.NORMAL,
    },
    password: {
        type: String,
        required: true,
    },
    active: {
        type: Boolean,
        required: true,
        default: true,
    },
});

userSchema.methods.sayHi = function (): void {
    console.log(`Hi! My name's ${this.name}`);
};


// Antes de registrar el usuario, generamos un hash para su contraseña.
userSchema.pre("save", async function (next: mongoose.CallbackWithoutResultAndOptionalError): Promise<void> {
    if (!this.isModified("password")) {
        return next();
    }
    try {
        const saltRounds: number = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
        next(); // No usar await acá.
    } catch (error: mongoose.CallbackError | any) {
        return next(error);
    }
});

/**
 * Método para verificar si un nombre de usuario está disponible.
 * @param username Nombre de usuario a verificar.
 * @returns true si el nombre de usuario está disponible, false si no.
 */
userSchema.statics.isUsernameAvailable = async function (username: string): Promise<boolean> {
    const user = await this.find({ username }).count();
    return user == 0;
};

/**
 * Método que compara una contraseña con el hash de la contraseña del usuario.
 * @param password Contraseña a comparar.
 * @returns true si la contraseña es correcta, false si no.
 */
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error: Error | undefined | any) {
        return false;
    }
};

type UserType = IUser & mongoose.Document;

const User: Model<UserType> = mongoose.model<UserType>("User", userSchema);
export default User;