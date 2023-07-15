'use strict';

interface IUsuario {
    NombreDeUsuario: string;
    Nombre: string;
    Apellido: string;
    Biografia: string;
    FechaDeNacimiento: Date;
    Tipo: string;
    Hash: string;
    SaltInicial: string;
    SaltFinal: string;
    Estado: boolean;
};
export {IUsuario};