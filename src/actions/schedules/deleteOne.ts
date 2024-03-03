'use strict';

import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import Schedule from "../../schemas/Schedule";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";
import IUser from "../../interfaces/models/IUser";

const deleteOne: endpoint[] = [pre.auth, async (req: Request, res: Response): Promise<void> => {
    try {
        const id: string = req.params.id;
        const resource = await Schedule.findById(id);
        const username = (<IUser>req.user)._id;
        const isAdmin = (<IUser>req.user).role >= 3;
        if (!resource) {
            res.status(404).json({error: E.ResourceNotFound});
            return;
        }
        if (resource.user != username && !isAdmin) {
            res.status(403).json({error: E.AttemptedUnauthorizedOperation});
            return;
        }
        resource.active = false;
        resource.history.push({
            content: "Deshabilitación del registro. ",
            time: Date.now(),
            user: (<IUser>req.user)._id as string
        });
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        });
    } catch (e) {
        const error: IError | null = defaultHandler(e as Error, E.CRUDOperationError);
        res.status(500).json({ error });
    }
}];

export default deleteOne;