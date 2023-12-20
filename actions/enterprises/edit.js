'use strict';
const pre = require("../../endpoints/pre");
const Enterprise = require("../../schemas/Enterprise");
const edit = [
    pre.auth,
    pre.allow.moderator,
    pre.verifyInput([
        "cuit",
        "name",
        "description",
        "foundationDate",
        "phones",
    ]),
    async (req, res) => {
        try {
            const id = req.params.id;
            const userId = req.user._id;
            const reg = await Enterprise.findOne({ _id: id, active: 1 });
            if (!reg) {
                res.status(404).json({
                    message: "There's no resource with that ID. ",
                });
                return;
            }
            if (reg.user.toString() != userId.toString()) {
                res.status(403).json({
                    message:
                        "You can't edit info about a resource that other user uploaded. ",
                });
                return;
            }
            const { cuit, name, description, foundationDate, phones } =
                req.body;
            reg.cuit = cuit;
            reg.name = name;
            reg.description = description;
            reg.foundationDate = foundationDate;
            reg.phones = phones;
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