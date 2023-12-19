'use strict';

const pre = require("../endpoints/pre");
const Photo = require("./Photo");
const handlePictures = (router, model) => {
    router.get("/:id/photos/", async (req, res) => {
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
                return res.status(404).end();
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
        async (req, res, next) => {
            const { id } = req.params;
            const dock = await model.findById(id);
            if (!dock) {
                return res.status(404).end();
            } else next();
        },
        pre.uploadPhoto,
        async (req, res) => {
            try {
                const archivo = req.file;
                const { description } = req.body;
                const userId = req.user._id;
                const { id } = req.params;
                const dock = await model.findById(id);
                if (!dock) {
                    return res.status(404).end();
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
        async (req, res) => {
            try {
                const { id, photoId } = req.params;
                const dock = model.findOne(id);
                if (!dock)
                    return res.status(404).end();
                await model.updateOne({ _id: id }, { $pull: { pictures: photoId } });
                // Eliminar foto en sí.
                let status = await Photo.deletePhotoById(photoId);
                if (status.success)
                    return res.status(200).json({
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
module.exports = { handlePictures };