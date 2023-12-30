'use strict';

const pre = require("../../endpoints/pre");
const Boat = require("../../schemas/Boat");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const ExpropiationError = require("../../errors/user/ExpropriationError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const deleteOne = [pre.auth, async (req, res) => {
    try {
        const id = req.params.id;
        const resource = await Boat.findById(id);
        const isAdmin = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            });
            return;
        }
        if (resource.user !== req.user._id && !isAdmin) {
            res.status(403).json({
                error: new ExpropiationError().toJSON()
            }).end();
            return;
        }
        resource.active = false;
        const status = await resource.save();
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: new CRUDOperationError().toJSON()
        }).end();
    }
}]; // Eliminar registro

module.exports = deleteOne;