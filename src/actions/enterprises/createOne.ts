'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {Request, Response, NextFunction} from "express";
const createOne = [
    pre.auth,
    pre.allow.admin,
    pre.verifyInput([
        "cuit",
        "name",
        "description",
        "foundationDate",
        "phones",
    ]),
    async (req: Request, res: Response, next: NextFunction) => {
        const { cuit } = req.body;
        const obj = await Enterprise.findOne({ cuit });
        if(!obj) next();
        else {
            res.status(400).json({
                error: 'new UniqueKeyViolationError().toJSON()'
            }).end();
        }
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { cuit, name, description, foundationDate, phones } =
                req.body;
            const userId = req.user._id;
            let reg = await Enterprise.create({
                user: userId,
                cuit,
                name,
                description,
                foundationDate,
                phones,
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