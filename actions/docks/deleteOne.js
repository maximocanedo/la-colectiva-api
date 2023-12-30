'use strict';

const Dock = require("../../schemas/Dock");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const ExpropiationError = require("../../errors/user/ExpropiationError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const deleteOne = async (req, res) => {
    try {
        const id = req.params.id;
        const resource = await Dock.findById(id);
        const username = req.user.username;
        const isAdmin = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            }).end();
            return;
        }
        if (resource.user !== req.user._id && !isAdmin) {
            res.status(403).json({
                error: new ExpropiationError().toJSON()
            });
            return;
        }
        resource.active = false;
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: new CRUDOperationError().toJSON()
        });
    }
};

module.exports = deleteOne;