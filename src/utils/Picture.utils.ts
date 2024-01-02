'use strict';
import pre from "../endpoints/pre";
import Photo from "../schemas/Photo";
import {Router, Response, Request, NextFunction} from "express";
import { Model } from "mongoose";
import IPictureable from "../interfaces/models/IPictureable";




const handlePictures = (router: Router, model: Model<IPictureable>): void => {
    router.get("/:id/photos/", async (req: Request, res: Response): Promise<void> => {
        try {
            const id = req.params.id;
            const resource = await model.findById(id)
                .select("pictures")
                .populate({
                    path: "pictures",
                    model: "Photo",
                    select: "_id user description uploadDate",
                    populate: {
                        path: "user",
                        model: "User",
                        select: "_id name",
                    },
                })
                .exec();
            if (!resource) {
                res.status(404).end();
            }
            res.status(200).json(resource);
        } catch (err) {
            console.error(err);
            res.status(500).end();
        }
    }); // Listar fotos
    router.post(
        "/:id/photos/",
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
                const userId = req.user._id;
                const { id } = req.params;
                const dock = await model.findById(id);
                if (!dock) {
                    res.status(404).end();
                }
                const photoId = await Photo.saveUploaded(
                    archivo,
                    userId,
                    description
                );
                await model.updateOne({ _id: id }, { $push: { pictures: photoId } });
                res.status(201).json({
                    id: photoId,
                    message: "The file was successfully saved. ",
                });
            } catch (err) {
                console.log(err);
                res.status(500).end();
            }
        }
    ); // Subir imagen
    router.delete(
        "/:id/photos/:photoId",
        pre.auth,
        pre.allow.moderator,
        async (req: Request, res: Response): Promise<void> => {
            try {
                const { id, photoId } = req.params;
                const dock = model.findById(id);
                if (!dock)
                    res.status(404).end();
                await model.updateOne({ _id: id }, { $pull: { pictures: photoId } });
                // Eliminar foto en sí.
                let status = await Photo.deletePhotoById(photoId);
                if (status.success)
                    res.status(200).json({
                        message: "Photo removed from resource",
                    });
                res.status(200).json({
                    message: "Photo unlinked from resource, but still exists. ",
                });
            } catch (err) {
                console.log(err);
                res.status(500).json({
                    message: "Internal error",
                });
            }
        }
    ); // Eliminar foto

};
export { handlePictures };