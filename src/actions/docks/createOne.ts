'use strict';

import pre from './../../endpoints/pre';
import WaterBody from "../../schemas/WaterBody";
import Dock from "../../schemas/Dock";
import {NextFunction, Request, Response} from "express";

const createOne = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput([
        "name",
        "address",
        "region",
        "notes",
        "status",
        "latitude",
        "longitude",
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
        const { region } = req.body;
        const obj = await WaterBody.findOne({ _id: region, active: true });
        if (!obj) {
            res.status(400).json({
                error: 'new ResourceNotFoundError().toJSON()'
            });
        } else next();
    },
    async (req: Request, res: Response) => {
        try {
            const {
                name,
                address,
                region,
                notes,
                status,
                latitude,
                longitude,
            } = req.body;
            const user = req.user._id;
            let reg = await Dock.create({
                user,
                name,
                address,
                region,
                notes,
                status,
                coordinates: [latitude, longitude],
            });
            res.status(201).json({
                id: reg._id,
                message: "The file was successfully saved. ",
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({
                error: 'new CRUDOperationError().toJSON()'
            });
        }
    }

];
export default createOne;