'use strict';
import Path, {IPathView} from "../../schemas/Path";
import { Request, Response } from "express";
import defaultHandler from "../../errors/handlers/default.handler";
import E from "../../errors";
import FetchResult from "../../interfaces/responses/FetchResult";
const list = [
    async (req: Request, res: Response): Promise<void> => {
        try {
            const q: string = req.query.q as string || "";
            const page: number = parseInt(req.query.p as string) || 0;
            const size: number = parseInt(req.query.itemsPerPage as string) || 10;
            const query = {
                $and: [
                    { active: true },
                    {
                        $or: [
                            { title: { $regex: q, $options: "i" } },
                            { description: { $regex: q, $options: "i"} },
                            { notes: { $regex: q, $options: "i" } }
                        ]
                    }
                ]
            };
            const { status, ...result }: FetchResult<IPathView> = await Path.listData(query, { page, size });
            res.status(status).json(result).end();
        } catch (err) {
            const error = defaultHandler(err as Error, E.CRUDOperationError);
            res.status(500).json({ data: [], error });
        }
    }
];
export default list;