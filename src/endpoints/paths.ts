"use strict";
import dotenv from "dotenv";
import express, {Request, Response, Router} from "express";
import Path from "../schemas/Path";
import { handleComments } from "../utils/Comment.utils";
import paths from "../actions/paths";
import { handleVotes } from "../utils/Validation.utils";
import schedules from "../actions/schedules";
import availabilities from "../actions/availabilities";
import pre, {IPaginator} from "./pre";
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

/* Acciones básicas */
router.post("/", paths.createOne); // Crear un registro
router.get("/", paths.list); // Ver todos los recursos

/* Acciones individuales */
router.get("/:id", paths.getOne); // Ver recurso
router.patch("/:id", paths.edit); // Editar recurso (PENDIENTE ALTERAR GLOBALMENTE)
router.delete("/:id", paths.deleteOne); // Eliminar registro
router.post("/:id", paths.enable); // Eliminar registro

/* Horarios */
router.get("/:id/schedules", paths.s.getAllSchedules);
router.post("/:id/schedules",  schedules.createOne(false));

/* Disponibilidades */
router.get("/:id/availabilities", availabilities.getByPath);
router.post("/:id/availabilities", availabilities.createOne(false));
router.delete("/:id/availabilities/:avid", availabilities.deleteOne);

router.get("/:id/history", pre.authenticate(true), pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const paginator: IPaginator = req.paginator as IPaginator;
        const data: IHistoryEvent[] = await history.getHistory({_id: id, model: Path, responsible: req.user as IUser, paginator});
        res.status(200).json({data}).end();
    } catch(err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error}).end();
    }
});

/* Validaciones */
handleVotes(router, Path);

/* Comentarios */
handleComments(router, Path);

export default router;
