"use strict";
import express, {Express, Request, Response} from 'express';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import { connectToDB } from './db';
import routes from './endpoints/index';
import cors from 'cors';
import pre from './endpoints/pre';
import users from './actions/users';
import * as Joi from 'joi';
import * as x from './validators/index';
import V from "./validators/index";
import rateLimit from "express-rate-limit";

const useSSL: boolean = true;

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
app.use(rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hora
    limit: 10000
}));

app.set('json spaces', 4);

// Conexión a la base de datos
(async (): Promise<void> => {
    await connectToDB((): void => {
        if (useSSL) https.createServer(options, app).listen(5050, (): void => {
            console.log("App listening...");
        }); else app.listen(5050, (): void => {
            console.log("App listening on local server...");
        });
    });
})();



// Routes
app.post("/auth", pre.expect({
    username: V.user.username,
    password: V.user.password.required(),
    email: V.user.mail,
    maxAge: Joi.string()
}), users.login);
app.delete("/auth", users.logout);
app.use("/users", routes.users);
app.use("/photos", routes.photos);
app.use("/comments", routes.comments);
app.use("/regions", routes.waterBodies);
app.use("/docks", routes.docks);
app.use("/enterprises", routes.enterprises);
app.use("/boats", routes.boats);
app.use("/paths", routes.paths);
app.use("/availabilities", routes.availabilities);
app.use("/schedules", routes.schedules);
app.use("/query", routes.query);
app.use("/reports", routes.reports);
