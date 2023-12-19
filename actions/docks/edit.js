'use strict';

const pre = require("../../endpoints/pre");
const Dock = require("../../schemas/Dock");
const {ObjectId} = require("mongodb");
const edit = [
    pre.auth,
    pre.allow.moderator,
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
                    message: "There's no resource with that ID. ",
                });
                return;
            }
            if (
                reg.user.toString() != userId.toString() ||
                req.user.role >= 2
            ) {
                res.status(403).json({
                    message:
                        "You can't edit info about a resource that other user uploaded. ",
                });
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
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Internal error. ",
            });
        }
    }
];

module.exports = edit;