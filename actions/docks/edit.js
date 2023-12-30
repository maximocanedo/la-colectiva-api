'use strict';

const pre = require("../../endpoints/pre");
const Dock = require("../../schemas/Dock");
const {ObjectId} = require("mongodb");
const ResourceNotFoundError = require("../../errors/resource/ResourceNotFoundError");
const ExpropiationError = require("../../errors/user/ExpropriationError");
const CRUDOperationError = require("../../errors/mongo/CRUDOperationError");
const edit = [
    pre.auth,
    pre.allow.moderator,
    // TODO not all properties are required.
    pre.verifyInput([
        "name",
        "address",
        "region",
        "notes",
        "status",
        "latitude",
        "longitude",
    ]),
    async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Dock.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    error: new ResourceNotFoundError().toJSON()
                }).end();
                return;
            }
            if (
                reg.user.toString() !== userId.toString() ||
                req.user.role >= 2
            ) {
                res.status(403).json({
                    error: new ExpropiationError().toJSON()
                }).end();
                return;
            }
            const {
                name,
                address,
                region,
                notes,
                status,
                latitude,
                longitude,
            } = req.body;
            reg.name = name;
            reg.address = address;
            reg.region = new ObjectId(region);
            reg.notes = notes;
            reg.status = status;
            reg.coordinates = [latitude, longitude];
            await reg.save();
            res.status(200).json({
                message: "Resource updated. ",
            }).end();
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: new CRUDOperationError().toJSON()
            }).end();
        }
    }
];

module.exports = edit;