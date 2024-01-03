'use strict';
import Dock from "../../schemas/Dock";
import { Request, Response } from "express";
const explore = async (res: Response, req: Request) => {
    try {
        const { lat, lng, radio } = req.params;
        const { prefer, q } = req.query;
        let coordinates = [lat, lng];
        const page = parseInt(req.query.p as string) || 0;
        const itemsPerPage = parseInt(req.query.itemsPerPage as string) || 10;
        let preferObj: any = {
            status: prefer,
            name: { $regex: q || "", $options: "i" },
        };
        if (parseInt(prefer as string) === -1) {
            preferObj = {
                status: { $gt: -1 },
                name: { $regex: q || "", $options: "i" },
            };
        }
        const query = {
            $and: [
                {
                    coordinates: {
                        $near: {
                            $geometry: {
                                type: "Point",
                                coordinates: [...coordinates], // [longitud, latitud]
                            },
                            $maxDistance: radio,
                        },
                    },
                },
                preferObj,
            ],
        };
        let result = await Dock.listData(query, {
            page,
            itemsPerPage,
        });

        res.status(result.status).json(result.items).end();
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'new CRUDOperationError().toJSON(),'
        }).end();
    }
};
export default explore;