"use strict";
const express = require("express");
const path = require("path");
const { ObjectId } = require("mongodb");
const { connectToDB, getDB } = require("./db");
const routes = require("./endpoints/index.js");

// Initialize
const app = express();

app.use(express.json());

let db;

// DB Connection
connectToDB((err) => {
	if (!err) {
		app.listen(3000, () => {
			console.log("App listening...");
		});
	}
});

// Routes
app.use("/users", routes.users);
app.use("/photos", routes.photos);
app.use("/comments", routes.comments);
app.use("/waterBodies", routes.waterBodies);
// Servir contenido estático de la carpeta 'simple-page'
app.use("/test", express.static(path.join(__dirname, "simple-page")));
