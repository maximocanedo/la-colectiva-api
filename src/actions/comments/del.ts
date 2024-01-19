'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import Comment from "../../schemas/Comment";
import E from "../../errors";
import {IError} from "../../interfaces/responses/Error.interfaces";
import defaultHandler from "../../errors/handlers/default.handler";

const del: endpoint[] = [
    pre.auth,
    pre.allow.normal,
    async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const result = await Comment.delete(id);
            if (!result.success) {
                // TODO Usar errores personalizados
                console.error(result.message);
                res.status(result.status).json({
                    message: result.message,
                });
                return;
            }
            res.status(result.status).json({
                message: result.message,
            });
        } catch (err) {
            const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ error });
        }
    }
];

export default del;