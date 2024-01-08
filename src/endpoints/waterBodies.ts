"use strict";
import dotenv from "dotenv";
import express, { Router, Request, Response, NextFunction }	from "express";
import WaterBody from "../schemas/WaterBody";
import pre from "./pre";
import { handleComments } from "../utils/Comment.utils";
import { handleVotes } from "../utils/Validation.utils";
import E from "../errors";
import V from "../validators";
import regions from "../actions/regions";
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

export default router;
