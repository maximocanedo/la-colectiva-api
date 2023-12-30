"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Boat = require("../schemas/Boat");
const {handleComments} = require("../schemas/CommentUtils");
const boats = require("../actions/boats");
const {handleVotes} = require("../schemas/ValidationUtils");
const {handlePictures} = require("../schemas/PictureUtils");

router.use(express.json());
router.use(cookieParser());

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




module.exports = router;
