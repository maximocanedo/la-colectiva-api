'use strict';

const pre = require("../../endpoints/pre");
const Enterprise = require("../../schemas/Enterprise");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const ExpropriationError = require("../../errors/user/ExpropriationError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const deleteOne = [pre.auth, async (req, res) => {
    try {
        const id = req.params.id;
        const resource = await Enterprise.findById(id);
        const username = req.user._id;
        const isAdmin = req.user.role >= 3;
        if (!resource) {
            res.status(404).json({
                error: new ResourceNotFoundError().toJSON()
            }).end();
            return;
        }
        if (resource.user !== username && !isAdmin) {
            res.status(403).json({
                error: new ExpropriationError().toJSON()
            }).end();
            return;
        }
        resource.active = false;
        const status = await resource.save();
        res.status(200).json({
            message: "Data was disabled. ",
        }).end();
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: new CRUDOperationError().toJSON()
        }).end();
    }
}];
module.exports = deleteOne;