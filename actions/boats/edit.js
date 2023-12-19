'use strict';

const pre = require("../../endpoints/pre");
const Boat = require("../../schemas/Boat");
const {ObjectId} = require("mongodb");
const edit = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput(["mat", "name", "status", "enterprise"]),
    async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Boat.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    message: "There's no resource with that ID. ",
                });
                return;
            }
            if (
                reg.user.toString() !== userId.toString() ||
                req.user.role >= 2
            ) {
                res.status(403).json({
                    message:
                        "You can't edit info about a resource that other user uploaded. ",
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
                message: "Internal error. ",
            });
        }
    }
];
module.exports = edit;