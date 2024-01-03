"use strict";

import Availability  from "../../schemas/Availability";
import { Request, Response } from "express";

const getOne = async (req: Request, res: Response) => {
    try {
        let { av_id } = req.params;
        let resource = await Availability.findOne(
            {
                _id: av_id,
                active: true,
            },
            {
                validations: 0,
            }
        )
            .populate("user", "_id name")
            .populate("path", "_id title");
        if (!resource) {
            return res.status(404).send({
                error: 'new ResourceNotFoundException().toJSON()',
            }).end();
        }
        res.status(200).json(resource);
    } catch (err: any) {
        if(err.name === 'MongoError') {
            return res.status(502).json({
                error: 'new InaccessibleResourceError().toJSON()'
            }).end();
        }
        else res.status(500).json({
            error: 'new DefaultError().toJSON()'
        }).end();
    }
};

export default getOne;