"use strict";
import dotenv from "dotenv";
import express, { Router } from "express";
import Path from "../schemas/Path";
import { handleComments } from "../utils/Comment.utils";
import paths from "../actions/paths";
import { handleVotes } from "../utils/Validation.utils";


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

/* Validaciones */
handleVotes(router, Path);

/* Comentarios */
handleComments(router, Path);

export default router;
