"use strict";
const https = require("https");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const { connectToDB, getDB } = require("./db");
const routes = require("./endpoints/index.js");
const cors = require("cors");
const pre = require("./endpoints/pre");
const users = require("./actions/users");


const useSSL = false;

// Cargar los certificados SSL
let options = {};

if(useSSL) options = {
	key: fs.readFileSync("/etc/letsencrypt/live/colectiva.com.ar/privkey.pem"),
	cert: fs.readFileSync("/etc/letsencrypt/live/colectiva.com.ar/cert.pem"),
};

// Inicializar la aplicación
const app = express();

app.use(express.json());

app.use(cors());


let db;

// Conexión a la base de datos
connectToDB((err) => {
	if (!err) {
		// Crear el servidor HTTPS
		if(useSSL) https.createServer(options, app).listen(5050, () => {
			console.log("App listening...");
		}); else app.listen(80, () => {
			console.log("App listening on local server...");
		});
	}
});


// Routes
app.post("/auth", pre.verifyInput(["username", "password"]), users.login);
app.delete("/auth", users.logout);
app.use("/users", routes.users);
app.use("/photos", routes.photos);
app.use("/comments", routes.comments);
app.use("/waterBodies", routes.waterBodies);
app.use("/docks", routes.docks);
app.use("/enterprises", routes.enterprises);
app.use("/boats", routes.boats);
app.use("/paths", routes.paths);
app.use("/availabilities", routes.availabilities);
app.use("/schedules", routes.schedules);
app.use("/query", routes.query);
