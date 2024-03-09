"use strict";

import dotenv from "dotenv";
import express, {Request, Response, Router} from "express";
import Enterprise from "../schemas/Enterprise";
import { handleComments } from "../utils/Comment.utils";
import enterprises from "../actions/enterprises";
import { handleVotes } from "../utils/Validation.utils";
import pre, {IPaginator} from "./pre";
import boats from "../actions/boats";
import {IHistoryEvent} from "../schemas/HistoryEvent";
import * as history from "../ext/history";
import Dock from "../schemas/Dock";
import IUser from "../interfaces/models/IUser";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";


dotenv.config();
const router: Router = express.Router();

router.use(express.json());


/* Validaciones */
handleVotes(router, Enterprise);

/* Comentarios */
handleComments(router, Enterprise);

/* Acciones básicas */
router.post("/", enterprises.createOne); // Crear un registro
router.get("/", enterprises.list); // Listar recursos
router.get("/:id/boats", boats.list(false));

/* Acciones individuales */
router.patch("/:id", enterprises.patchEdit); // Editar recurso
router.get("/:id", enterprises.getOne); // Ver recurso
router.put("/:id", enterprises.edit); // Editar recurso
router.delete("/:id", enterprises.deleteOne); // Eliminar registro
router.post("/:id", enterprises.enable); // Eliminar registro

/* Acciones con teléfonos */
router.get("/:id/phones", pre.auth, enterprises.phones.list); // Listar números de teléfono
router.post("/:id/phones", pre.auth, pre.allow.moderator, enterprises.phones.createOne); // Agregar un número de teléfono
router.delete("/:id/phones", pre.auth, pre.allow.moderator, enterprises.phones.deleteOne); // Eliminar un número de teléfono

router.get("/:id/history", pre.authenticate(true), pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const paginator: IPaginator = req.paginator as IPaginator;
        const data: IHistoryEvent[] = await history.getHistory({_id: id, model: Enterprise, responsible: req.user as IUser, paginator});
        res.status(200).json({data}).end();
    } catch(err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error}).end();
    }
});

export default router;
