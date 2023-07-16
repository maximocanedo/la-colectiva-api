"use strict";
const express = require("express");
const actions = require("./actions/index");
const app = express();
app.use(express.json());

/* Pre-respuesta */
app.use((req, res, next) => {
	res.set("Content-Type", "application/json; charset=utf-8");
	next();
});

/* Obtener data */
app.get("/users/me", actions.authenticateToken, actions.viewMyUser);
app.post(
	"/users/me/changePassword",
	actions.authenticateToken,
	actions.changePassword
);
app.get("/users/:username", actions.getUserByUsername);
app.post("/users/add", actions.createUser);

/* Manejo de sesiones */
app.post("/login", actions.login);
app.post("/logout", actions.authenticateToken, actions.logout);

/* Probar conexión */
app.get("/protected", actions.authenticateToken, (req, res) => {
	console.log({ username: req.user.username });
	res.json({ message: "Acceso permitido", username: req.user });
});

/* Puesta en marcha del servidor */
app.listen(3000, () => {
	console.log(`Servidor escuchando en el puerto 3000...`);
});
