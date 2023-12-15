"use strict";
const https = require("https");
const express = require("express");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const { connectToDB, getDB } = require("./db");
const routes = require("./endpoints/index.js");
const cors = require("cors");

// Cargar los certificados SSL
const options = {
	key: fs.readFileSync("/etc/letsencrypt/live/colectiva.com.ar/privkey.pem"),
	cert: fs.readFileSync("/etc/letsencrypt/live/colectiva.com.ar/cert.pem"),
};

// Inicializar la aplicación
const app = express();

app.use(express.json());

app.use(cors({
	origin: ['http://localhost', 'https://colectiva.com.ar', 'https://149.50.132.47', 'http://colectiva.com.ar', 'http://149.50.132.47'],
	credentials: true
}));

let db;

// Conexión a la base de datos
connectToDB((err) => {
	if (!err) {
		// Crear el servidor HTTPS
		https.createServer(options, app).listen(5050, () => {
			console.log("App listening...");
		});
	}
});

// Routes
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
