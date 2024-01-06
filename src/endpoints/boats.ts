"use strict";

import express, {Router} from "express";
import { handleComments } from "../utils/Comment.utils";
import Boat from "../schemas/Boat";
import boats from "../actions/boats";
import { handleVotes } from "../utils/Validation.utils";
import { handlePictures } from "../utils/Picture.utils";


const router: Router = express.Router();

router.use(express.json());

handleComments(router, Boat);

/* Acciones básicas */
router.post("/", boats.createOne); // Ver recurso
router.get("/", boats.list); // Listar recursos
router.get("/:id", boats.getOne); // Ver recurso
router.patch("/:id", boats.edit); // Editar recurso
router.delete("/:id", boats.deleteOne); // Eliminar registro



/* Validaciones */
handleVotes(router, Boat);

/* Imágenes */
handlePictures(router, Boat);




export default router;
