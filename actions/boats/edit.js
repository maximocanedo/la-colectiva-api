'use strict';

const pre = require("../../endpoints/pre");
const Boat = require("../../schemas/Boat");
const {ObjectId} = require("mongodb");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const ExpropriationError = require("../../errors/DefaultError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");

const edit = [
    pre.auth,
    pre.allow.moderator,
    // TODO: Not all properties are required.
    pre.verifyInput(["mat", "name", "status", "enterprise"]),
    async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Boat.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: new ResourceNotFoundError().toJSON(),
                }).end();
                return;
            }
            if (
                reg.user.toString() !== userId.toString() ||
                !(req.user.role >= 3)
            ) {
                res.status(403).json({
                    error: new ExpropriationError().toJSON(),
                });
                return;
            }
            const { mat, name, status, enterprise } = req.body;
            reg.name = name;
            reg.mat = mat;
            reg.enterprise = new ObjectId(enterprise);
            reg.status = status;
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: new CRUDOperationError().toJSON(),
            });
        }
    }
];
module.exports = edit;