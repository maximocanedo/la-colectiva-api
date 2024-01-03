'use strict';
import Boat from "../../schemas/Boat";
import { Request, Response } from "express";
import IBoat from "../../interfaces/models/IBoat";
import IUser from "../../interfaces/models/IUser";
const getOne = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        // Utiliza findOne para buscar un registro con ID y active: true
        let resource = await Boat.findOne({ _id: id, active: true, status: true }, {
            mat: 1,
            name: 1,
            status: 1,
            _id: 1,
            active: 1,
            enterprise: 1,
            user: 1,
            uploadDate: 1,
            pictures: 1
        })
            .populate("user", "name _id")
            .populate("enterprise", "name _id");

        if (!resource) {
            res.status(404).json({
                error: 'new ResourceNotFoundError().toJSON()'
            }).end();
            return;
        }

        // @ts-ignore
        res.status(200).json({
            user: {
                name: ((resource as IBoat).user as IUser).name,
                _id: (resource.user as IUser)._id,
            },
            mat: resource.mat,
            name: resource.name,
            enterprise: {
                // @ts-ignore
                _id: resource.enterprise._id,
                // @ts-ignore
                name: resource.enterprise.name,
            },
            status: resource.status,
            uploadDate: resource.uploadDate,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'new CRUDOperationError().toJSON(),'
        }).end();
    }
};
export default getOne;