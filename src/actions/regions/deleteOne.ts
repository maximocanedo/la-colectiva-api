'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import E from "../../errors";
import defaultHandler from "../../errors/handlers/default.handler";
import * as regions from "../../ext/regions";
import IUser from "../../interfaces/models/IUser";
import {IError} from "../../interfaces/responses/Error.interfaces";

const deleteOne: endpoint[] = [
    pre.auth,
    pre.allow.moderator,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const responsible: IUser = req.user as IUser;
            const id: string = req.params.id;
            await regions.del({ id, responsible });
            res.status(200).json({
                message: "Data was disabled. ",
            }).end();
        } catch (err) {
            const { http, ...error }: IError = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(http?? 500).json({ error }).end();
        }
    }
];

export default deleteOne;