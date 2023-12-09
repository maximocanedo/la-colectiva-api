"use strict";
const express = require("express");
const path = require("path");
const { ObjectId } = require("mongodb");
const { connectToDB, getDB } = require("./db");
const routes = require("./endpoints/index.js");
const cors = require("cors");

// Initialize
const app = express();

app.use(express.json());

app.use(cors({
	origin: 'http://localhost',
	credentials: true
}));

let db;

// DB Connection
connectToDB((err) => {
	if (!err) {
		app.listen(5050, () => {
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
