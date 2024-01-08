'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import {Request, Response} from "express";
import Schedule from "../../schemas/Schedule";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";

const getOne: endpoint[] = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id: string = req.params.id;
            // Utiliza findOne para buscar un registro con ID y active: true
            let resource = await Schedule.findOne({ _id: id, active: true })
                .populate({
                    path: "path",
                    model: "Path",
                    select: "_id title boat",
                    populate: {
                        path: "boat",
                        model: "Boat",
                        select: "_id name",
                    },
                })
                .populate({ path: "dock", model: "Dock", select: "_id name" });

            if (!resource) {
                res.status(404).json({error: E.ResourceNotFound});
                return;
            }

            const { path, dock, user, time, active } = resource;
            // Envía la imagen como respuesta
            res.status(200).json({
                path,
                dock,
                time,
                user,
                active
            });
        } catch (e) {
            const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default getOne;