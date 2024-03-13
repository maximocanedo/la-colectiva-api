"use strict";

import express, {Router, Response, Request} from "express";
import { handleComments } from "../utils/Comment.utils";
import Boat, {IBoatModel} from "../schemas/Boat";
import boats from "../actions/boats";
import { handleVotes } from "../utils/Validation.utils";
import { handlePictures } from "../utils/Picture.utils";
import pre, {IPaginator} from "./pre";
import * as history from "../ext/history";
import IUser from "../interfaces/models/IUser";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";
import IBoat from "../interfaces/models/IBoat";
import {BoatDocument} from "../ext/boats/defs";
import {Document, Model} from "mongoose";


const router: Router = express.Router();

router.use(express.json());

handleComments(router, Boat);

/* Acciones básicas */
router.post("/", boats.createOne); // Ver recurso
router.get("/", boats.list(true)); // Listar recursos
router.get("/:id", boats.getOne); // Ver recurso
router.head("/:id", boats.getOne);
router.patch("/:id", boats.edit); // Editar recurso
router.delete("/:id", boats.deleteOne); // Eliminar registro
router.post("/:id", boats.enable);
router.get("/:id/history", pre.authenticate(true), pre.paginate, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const paginator: IPaginator = req.paginator as IPaginator;
        const data = await history.getHistory({_id: id, model: Boat, responsible: req.user as IUser, paginator});
        res.status(200).json({data}).end();
    } catch(err) {
        const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(http?? 500).json({error}).end();
    }
});


/* Validaciones */
handleVotes(router, Boat);

/* Imágenes */
handlePictures(router, Boat);




export default router;
