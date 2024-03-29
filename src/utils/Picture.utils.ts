'use strict';
import pre, {IPaginator} from "../endpoints/pre";
import Photo from "../schemas/Photo";
import {Router, Response, Request, NextFunction} from "express";
import { Model } from "mongoose";
import IPictureable from "../interfaces/models/IPictureable";
import {IError} from "../interfaces/responses/Error.interfaces";
import defaultHandler from "../errors/handlers/default.handler";
import E from "../errors";
import IUser from "../interfaces/models/IUser";




const handlePictures = (router: Router, model: Model<IPictureable> | any): void => {
    router.get("/:id/pictures/", pre.paginate, async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const { page, size }: IPaginator = req.paginator as IPaginator;
            const resource = await model.findById(id)
                .select("pictures")
                .populate({
                    path: "pictures",
                    model: "Photo",
                    select: "_id user description uploadDate",
                    options: {
                        sort: { uploadDate: -1 },
                        skip: page * size,
                        limit: size,
                    },
                    populate: {
                        path: "user",
                        model: "User",
                        select: "_id name username",
                    },
                })
                .exec();
            if (!resource) {
                res.status(404).json({
                    error: E.ResourceNotFound
                }).end();
            }
            res.status(200).json(resource);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }); // Listar fotos
    router.post(
        "/:id/pictures/",
        pre.auth,
        pre.allow.moderator,
        async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const { id } = req.params;
            const dock = await model.findById(id);
            if (!dock) {
                res.status(404).end();
            } else next();
        },
        pre.uploadPhoto,
        async (req: Request, res: Response): Promise<void> => {
            try {
                const archivo = req.file;
                const { description } = req.body;
                const userId = (<IUser>req.user)._id as string;
                const { id } = req.params;
                const dock = await model.findById(id);
                if (!dock) {
                    res.status(404).json({
                        error: E.ResourceNotFound
                    }).end();
                }
                const photoId = await Photo.saveUploaded(
                    archivo,
                    userId,
                    description
                );
                await model.updateOne({ _id: id }, {
                    $push: {
                        pictures: photoId,
                        history: {
                            content: "Vincular imagen. ",
                            time: Date.now(),
                            user: (<IUser>req.user)._id as string
                        }
                    }
                });
                res.status(201).json({
                    id: photoId,
                    message: "The file was successfully saved. ",
                });
            } catch (err) {
                const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
                res.status(500).json({ error });
            }
        }
    ); // Subir imagen
    router.delete(
        "/:id/pictures/:photoId",
        pre.auth,
        pre.allow.moderator,
        async (req: Request, res: Response): Promise<void> => {
            try {
                const { id, photoId } = req.params;
                const dock = model.findById(id);
                if (!dock) {
                    res.status(404).json({
                        error: E.ResourceNotFound
                    }).end();
                    return;
                }
                await model.updateOne({ _id: id }, {
                    $pull: { pictures: photoId },
                    $push: {
                        history: {
                            content: "Desvincular imagen. ",
                            time: Date.now(),
                            user: (<IUser>req.user)._id as string
                        }
                    }
                });
                // Eliminar foto en sí.
                let status = await Photo.deletePhotoById(photoId);
                if (status.success) {
                    res.status(200).json({
                        message: "Photo removed from resource",
                    }).end();
                    return;
                }
                res.status(200).json({
                    message: "Photo unlinked from resource, but still exists. ",
                });
            } catch (err) {
                const error: IError | null = defaultHandler(err as Error, E.CRUDOperationError);
                res.status(500).json({ error });
            }
        }
    ); // Eliminar foto

};
export { handlePictures };