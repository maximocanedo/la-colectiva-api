"use strict";
require("dotenv").config();
const express = require("express");
const router = express.Router();
const cookieParser = require("cookie-parser");
const Enterprise = require("../schemas/Enterprise");
const pre = require("./pre");
const Comment = require("../schemas/Comment");
const Path = require("../schemas/Path");
const { handleComments } = require("../schemas/CommentUtils");
const {handleVotes} = require("../schemas/ValidationUtils");
const enterprises = require("../actions/enterprises");

router.use(express.json());
router.use(cookieParser());

/* Acciones básicas */
router.post("/", enterprises.createOne); // Crear un registro
router.get("/", enterprises.list); // Listar recursos

/* Acciones individuales */
router.patch("/:id", enterprises.patchEdit); // Editar recurso
router.get("/:id", enterprises.getOne); // Ver recurso
router.put("/:id", enterprises.edit); // Editar recurso
router.delete("/:id", enterprises.deleteOne); // Eliminar registro

/* Acciones con teléfonos */
router.get("/:id/phones", enterprises.phones.list); // Listar números de teléfono
router.post("/:id/phones", enterprises.phones.createOne); // Agregar un número de teléfono
router.delete("/:id/phones", enterprises.phones.deleteOne); // Eliminar un número de teléfono

/* Validaciones */
handleVotes(router, Enterprise);

/* Comentarios */
handleComments(router, Enterprise);

module.exports = router;
