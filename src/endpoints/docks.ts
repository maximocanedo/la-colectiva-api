"use strict";
import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import Dock from "../schemas/Dock";
import pre, {IPaginator} from "./pre";
import { handleComments } from "../utils/Comment.utils";
import docks from "../actions/docks";
import { handleVotes } from "../utils/Validation.utils";
import { handlePictures } from "../utils/Picture.utils";
import * as history from "../ext/history";
import Boat from "../schemas/Boat";
import IUser from "../interfaces/models/IUser";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";
import {IHistoryEvent} from "../schemas/HistoryEvent";

dotenv.config();
const router: Router = express.Router();

router.use(express.json());

/* Listados */
router.get("/@:lat,:lng,:radio", docks.explore); // Listar recursos
router.get("/", docks.list); // Listar recursos
/* Acciones básicas */
router.post("/", docks.createOne); // Crear un registro
router.get("/:id([0-9a-fA-F]{24})", docks.getOne); // Ver recurso
router.patch("/:id", docks.edit); // Editar recurso
router.delete("/:id", pre.auth, pre.allow.moderator, docks.deleteOne); // Eliminar registro
router.post("/:id", pre.auth, pre.allow.moderator, docks.enable);
router.get("/:id/history", pre.authenticate(true), pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const paginator: IPaginator = req.paginator as IPaginator;
        const data: IHistoryEvent[] = await history.getHistory({_id: id, model: Dock, responsible: req.user as IUser, paginator});
        res.status(200).json({data}).end();
    } catch(err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error}).end();
    }
});

/* Comentarios */
handleComments(router, Dock);

/* Validaciones */
handleVotes(router, Dock);

/* Imágenes */
handlePictures(router, Dock);

export default router;
