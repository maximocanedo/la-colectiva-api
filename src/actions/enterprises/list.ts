'use strict';
import Enterprise, {IEnterpriseView} from "../../schemas/Enterprise";
import { Request, Response, NextFunction } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
const list = async (req: Request, res: Response): Promise<void> => {
    try {
        const q: string = req.query.q as string || "";
        const page: number = parseInt(req.query.p as string) || 0;
        const itemsPerPage: number = parseInt(req.query.itemsPerPage as string) || 10;
        const { status, ...result }: FetchResult<IEnterpriseView> = await Enterprise.listData({
            $and: [
                { active: true },
                {
                    $or: [
                        { name: { $regex: q, $options: "i" } },
                        { description: { $regex: q, $options: "i" } }
                    ]
                }
            ]
        }, { page, itemsPerPage });
        res.status(status).json(result);
    } catch (err) {
        const error = defaultHandler(err as Error, E.CRUDOperationError);
        res.status(500).json({ error, data: [] });
    }
};
export default list;