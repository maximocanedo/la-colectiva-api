"use strict";
import dotenv from "dotenv";
import express, {Request, Response, Router} from "express";
import Schedule from "../schemas/Schedule";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";
import schedules from "../actions/schedules";
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

handleComments(router, Schedule);
handleVotes(router, Schedule);

/* Acciones básicas */
router.post("/", schedules.createOne(true)); // Crear un registro
router.get("/:id", schedules.getOne); // Ver recurso
router.patch("/:id", schedules.edit); // Editar recurso
router.delete("/:id", schedules.deleteOne); // Eliminar registro
router.post("/:id", schedules.enable); // Eliminar registro

router.get("/:id/history", pre.authenticate(true), pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const paginator: IPaginator = req.paginator as IPaginator;
        const data: IHistoryEvent[] = await history.getHistory({_id: id, model: Schedule, responsible: req.user as IUser, paginator});
        res.status(200).json({data}).end();
    } catch(err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error}).end();
    }
});


export default router;
