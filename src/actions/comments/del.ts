'use strict';
import {endpoint} from "../../interfaces/types/Endpoint";
import pre from "../../endpoints/pre";
import {Request, Response} from "express";
import Comment from "../../schemas/Comment";
import E from "../../errors";

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
            console.error(err);
            res.status(500).json({ error: E.InternalError });
        }
    }
];

export default del;