"use strict";
import dotenv from "dotenv";
import express, { Request, Response, Router } from "express";
import Dock from "../schemas/Dock";
import pre from "./pre";
import { handleComments } from "../utils/Comment.utils";
import docks from "../actions/docks";
import { handleVotes } from "../utils/Validation.utils";
import { handlePictures } from "../utils/Picture.utils";

dotenv.config();
const router: Router = express.Router();

router.use(express.json());

/* Listados */
router.get("/@:lat(\\-?\\d+(\\.\\d+)?),:lng(\\-?\\d+(\\.\\d+)?),:radio(\\d+?)", docks.explore); // Listar recursos
router.get("/", docks.list); // Listar recursos

/* Acciones básicas */
router.post("/", docks.createOne); // Crear un registro
router.get("/:id", docks.getOne); // Ver recurso
router.patch("/:id", docks.edit); // Editar recurso
router.delete("/:id", pre.auth, pre.allow.moderator, docks.deleteOne); // Eliminar registro

/* Comentarios */
handleComments(router, Dock);

/* Validaciones */
handleVotes(router, Dock);

/* Imágenes */
handlePictures(router, Dock);

export default router;
