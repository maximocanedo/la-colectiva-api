"use strict";
import dotenv from "dotenv";
import express, {Router} from "express";
import Schedule from "../schemas/Schedule";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";
import schedules from "../actions/schedules";


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



export default router;
