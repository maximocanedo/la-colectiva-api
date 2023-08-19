"use strict";
require("dotenv").config();
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");

let dbConnection;
const atlasConnectionString = process.env.MONGODB_LOCAL_CONNECTION_STRING;

/// Conecta con el servidor de MongoDB.
const connectToDB = (cb) => {
	return mongoose.connect(atlasConnectionString) && cb();
};

/// Obtener la base de datos.
const getDB = () => dbConnection;

/// Exportando funciones.
module.exports = {
	connectToDB,
	getDB,
};
