'use strict';
import pre from "../../endpoints/pre";
import Dock from "../../schemas/Dock";
import { ObjectId } from "mongodb";
import {NextFunction, Request, Response} from "express";
import {IError} from "../../interfaces/responses/Error.interfaces";
import E from "../../errors";
import V from "../../validators";
import WaterBody from "../../schemas/WaterBody";
import defaultHandler from "../../errors/handlers/default.handler";
import {endpoint} from "../../interfaces/types/Endpoint";
const edit: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        name: V.dock.name,
        address: V.dock.address,
        region: V.dock.region,
        notes: V.dock.notes,
        coordinates: V.dock.coordinates
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { name, address, region, notes, coordinates } = req.body;
        if(!name && !address && !region && !notes && (!coordinates || coordinates.length == 0)) {
            res.status(400).json({
                error: E.AtLeastOneFieldRequiredError
            });
            return;
        } else next();
    },
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { region } = req.body;
        if(!region) next();
        else {
            const obj = await WaterBody.findOne({_id: region, active: true});
            if (!obj) {
                res.status(400).json({
                    error: E.ResourceNotFound
                });
            } else next();
        }
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            const userId = req.user._id;
            const reg = await Dock.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            if (
                reg.user.toString() !== userId.toString() &&
                req.user.role < 3
            ) {
                res.status(403).json({
                    error: E.UnauthorizedRecordModification
                }).end();
                return;
            }
            const {
                name,
                address,
                region,
                notes,
                status,
                coordinates
            } = req.body;
            if(name) reg.name = name;
            if(address) reg.address = address;
            if(region) reg.region = new ObjectId(region);
            if(notes) reg.notes = notes;
            if(status) reg.status = status;
            if(coordinates) reg.coordinates = coordinates;
            reg.history.push({
                content: "Edición parcial del registro. ",
                time: Date.now(),
                user: req.user._id
            });
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            }).end();
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default edit;