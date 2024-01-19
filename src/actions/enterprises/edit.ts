'use strict';
import pre from "../../endpoints/pre";
import Enterprise from "../../schemas/Enterprise";
import {NextFunction, Request, Response} from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import V from "../../validators";
const edit = [
    pre.auth,
    pre.allow.moderator,
    pre.expect({
        cuit: V.enterprise.cuit.required(),
        name: V.enterprise.name.required(),
        description: V.enterprise.description.required(),
        foundationDate: V.enterprise.foundationDate.required(),
        phones: V.enterprise.phones.required()
    }),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { cuit } = req.body;
        const { id } = req.params;
        if(!cuit) next();
        else {
            const reg = await Enterprise.findOne({ cuit });
            if(!reg) next();
            else {
                if(reg._id === id) next();
                else res.status(409).json({ error: E.DuplicationError }).end();
            }
        }
        return;
    },
    async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Enterprise.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
                return;
            }
            if (reg.user.toString() !== userId.toString()) {
                res.status(403).json({
                    error: E.UnauthorizedRecordModification
                });
                return;
            }
            const { cuit, name, description, foundationDate, phones } =
                req.body;
            reg.cuit = cuit;
            reg.name = name;
            reg.description = description;
            reg.foundationDate = foundationDate;
            reg.phones = phones;
            reg.history.push({
                content: "Edición completa del recurso. ",
                time: Date.now(),
                user: req.user._id
            });
            await reg.save();
            res.status(200).json({
                message: "Resource updated. "
            });
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({error});
        }
    }
];
export default edit;