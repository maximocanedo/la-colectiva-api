"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Dock = require("../schemas/Dock");
const Photo = require("../schemas/Photo");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const { ObjectId } = require("mongodb");
const Enterprise = require("../schemas/Enterprise");
const {handleComments} = require("../schemas/CommentUtils");
const docks = require("../actions/docks");
const {handleVotes} = require("../schemas/ValidationUtils");
const {handlePictures} = require("../schemas/PictureUtils");

router.use(express.json());
router.use(cookieParser());

/* Listados */
router.get("/@:lat(\\-?\\d+(\\.\\d+)?),:lng(\\-?\\d+(\\.\\d+)?),:radio(\\d+?)", docks.explore); // Listar recursos
router.get("/", docks.list); // Listar recursos

/* Acciones básicas */
router.post("/", docks.createOne); // Crear un registro
router.get("/:id", docks.getOne); // Ver recurso
router.patch("/:id", docks.edit); // Editar recurso
router.delete("/:id", pre.auth, docks.deleteOne); // Eliminar registro

/* Comentarios */
handleComments(router, Dock);

/* Validaciones */
handleVotes(router, Dock);

/* Imágenes */
handlePictures(router, Dock);

module.exports = router;
