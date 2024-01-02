"use strict";
import express, {Express, Request, Response} from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import { connectToDB } from './db';
import routes from './endpoints/index.ts';
import cors from 'cors';
import pre from './endpoints/pre';
import users from './actions/users';

const useSSL: boolean = false;

// Cargar los certificados SSL
let options: any = {};

if(useSSL) options = {
    key: fs.readFileSync("/etc/letsencrypt/live/colectiva.com.ar/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/colectiva.com.ar/cert.pem"),
};

// Inicializar la aplicación
const app: Express = express();

app.use(express.json());

app.use(cors());

// Conexión a la base de datos
(async () => {
    await connectToDB(() => {
        // Crear el servidor HTTPS
        if (useSSL) https.createServer(options, app).listen(5050, () => {
            console.log("App listening...");
        }); else app.listen(80, () => {
            console.log("App listening on local server...");
        });
    });
})();

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