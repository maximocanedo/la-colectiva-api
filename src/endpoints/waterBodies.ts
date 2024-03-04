"use strict";
import dotenv from "dotenv";
import express, { Router, Request, Response, NextFunction }	from "express";
import WaterBody from "../schemas/WaterBody";
import pre, {IPaginator} from "./pre";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";
import E from "../errors";
import V from "../validators";
import regions from "../actions/regions";
import {IHistoryEvent} from "../schemas/HistoryEvent";
import * as history from "../ext/history";
import Dock from "../schemas/Dock";
import IUser from "../interfaces/models/IUser";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
dotenv.config();
const router: Router = express.Router();
router.use(express.json());

handleComments(router, WaterBody);
handleVotes(router, WaterBody);

/* Acciones básicas */
router.get("/", regions.list)
router.post("/", regions.createOne); // Crear un registro
router.get("/:id", regions.getOne); // Ver recurso
router.patch("/:id", regions.edit); // Editar recurso
router.delete("/:id", regions.deleteOne); // Eliminar registro
router.post("/:id", regions.enable); // Eliminar registro

router.get("/:id/history", pre.authenticate(true), pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const paginator: IPaginator = req.paginator as IPaginator;
        const data: IHistoryEvent[] = await history.getHistory({_id: id, model: WaterBody, responsible: req.user as IUser, paginator});
        res.status(200).json({data}).end();
    } catch(err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error}).end();
    }
});
export default router;
