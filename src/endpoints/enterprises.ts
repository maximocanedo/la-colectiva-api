"use strict";

import dotenv from "dotenv";
import express, { Router } from "express";
import Enterprise from "../schemas/Enterprise";
import { handleComments } from "../utils/Comment.utils";
import enterprises from "../actions/enterprises";
import { handleVotes } from "../utils/Validation.utils";
import pre from "./pre";


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

/* Acciones individuales */
router.patch("/:id", enterprises.patchEdit); // Editar recurso
router.get("/:id", enterprises.getOne); // Ver recurso
router.put("/:id", enterprises.edit); // Editar recurso
router.delete("/:id", enterprises.deleteOne); // Eliminar registro

/* Acciones con teléfonos */
router.get("/:id/phones", pre.auth, pre.allow.moderator, enterprises.phones.list); // Listar números de teléfono
router.post("/:id/phones", pre.auth, pre.allow.moderator, enterprises.phones.createOne); // Agregar un número de teléfono
router.delete("/:id/phones", pre.auth, pre.allow.moderator, enterprises.phones.deleteOne); // Eliminar un número de teléfono


export default router;
