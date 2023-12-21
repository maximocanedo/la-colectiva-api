"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Path = require("../schemas/Path");
const pre = require("./pre");
const { handleComments } = require("../schemas/CommentUtils");
const {handleVotes} = require("../schemas/ValidationUtils");
const paths = require("../actions/paths");

router.use(express.json());
router.use(cookieParser());

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

module.exports = router;
