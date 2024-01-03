"use strict";
import Availability from "../../schemas/Availability";
import { Request, Response } from "express";

const deleteOne = async (req: Request, res: Response) => {
    try {
        const { av_id } = req.params;
        const resource = await Availability.findOne({ _id: av_id });
        if (!resource) {
            return res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON(),'
            }).end();
        }
        resource.active = false;
        await resource.save();
        res.status(200).json({
            message: "Deleted",
        }).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new DeleteOperationError().toJSON()'
        }).end();
    }
};

export default deleteOne;