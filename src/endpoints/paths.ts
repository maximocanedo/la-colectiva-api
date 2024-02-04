"use strict";
import dotenv from "dotenv";
import express, { Router } from "express";
import Path from "../schemas/Path";
import { handleComments } from "../utils/Comment.utils";
import paths from "../actions/paths";
import { handleVotes } from "../utils/Validation.utils";
import schedules from "../actions/schedules";
import availabilities from "../actions/availabilities";


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

/* Horarios */
router.get("/:id/schedules", paths.s.getAllSchedules);
router.post("/:id/schedules",  schedules.createOne(false));

/* Disponibilidades */
router.get("/:id/availabilities", availabilities.getByPath);
router.post("/:id/availabilities", availabilities.createOne(false));
router.delete("/:id/availabilities/:avid", availabilities.deleteOne);


/* Validaciones */
handleVotes(router, Path);

/* Comentarios */
handleComments(router, Path);

export default router;
